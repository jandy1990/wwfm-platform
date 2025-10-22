#!/usr/bin/env tsx

import { readFileSync } from 'fs'
import path from 'path'
import ts from 'typescript'
import { CATEGORY_FIELD_CONFIG } from './field-generation-utils/category-config'

const DOC_PATH = path.join('docs', 'solution-fields-ssot.md')
const GOAL_CLIENT_PATH = path.join('components', 'goal', 'GoalPageClient.tsx')

interface DocEntry {
  fields: string[]
  arrayField: string | null
}

function normalizeField(value: string): string {
  return value.replace(/[*`⚠️]/g, '').replace(/\(only 3 fields\)/gi, '').trim()
}

function parseDocTable(): Record<string, DocEntry> {
  const raw = readFileSync(DOC_PATH, 'utf-8')
  const lines = raw.split('\n')
  const entries: Record<string, DocEntry> = {}

  for (const line of lines) {
    if (!line.startsWith('|') || !line.includes('`')) continue
    const cells = line.split('|').map(cell => normalizeField(cell))
    const category = cells[1]
    if (!category || category === 'Category') continue

    const fieldCells = cells.slice(2, 6).map(cell => cell.split(',')[0].trim()).filter(Boolean)
    const arrayField = cells[6] ? (cells[6].toLowerCase() === 'null' ? null : cells[6]) : null

    entries[category] = {
      fields: fieldCells.filter(Boolean),
      arrayField
    }
  }

  return entries
}

interface FrontendEntry {
  keyFields: string[]
  arrayField: string | null
}

function parseFrontendConfig(): Record<string, FrontendEntry> {
  const sourceText = readFileSync(GOAL_CLIENT_PATH, 'utf-8')
  const sourceFile = ts.createSourceFile(GOAL_CLIENT_PATH, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const results: Record<string, FrontendEntry> = {}

  function extractStringArray(node: ts.ArrayLiteralExpression): string[] {
    return node.elements
      .filter((element): element is ts.StringLiteral => ts.isStringLiteral(element))
      .map(element => element.text)
  }

  sourceFile.forEachChild(node => {
    if (!ts.isVariableStatement(node)) return
    const declaration = node.declarationList.declarations.find(decl => ts.isIdentifier(decl.name) && decl.name.text === 'CATEGORY_CONFIG')
    if (!declaration || !declaration.initializer || !ts.isObjectLiteralExpression(declaration.initializer)) return

    declaration.initializer.properties.forEach(prop => {
      if (!ts.isPropertyAssignment(prop)) return
      const nameNode = prop.name
      let categoryName: string | null = null

      if (ts.isIdentifier(nameNode)) categoryName = nameNode.text
      else if (ts.isStringLiteral(nameNode)) categoryName = nameNode.text

      if (!categoryName || !ts.isObjectLiteralExpression(prop.initializer)) return

      const entry: FrontendEntry = { keyFields: [], arrayField: null }

      prop.initializer.properties.forEach(innerProp => {
        if (!ts.isPropertyAssignment(innerProp)) return
        const innerName = innerProp.name
        let propertyName: string | null = null

        if (ts.isIdentifier(innerName)) propertyName = innerName.text
        else if (ts.isStringLiteral(innerName)) propertyName = innerName.text

        if (!propertyName) return

        if (propertyName === 'keyFields' && ts.isArrayLiteralExpression(innerProp.initializer)) {
          entry.keyFields = extractStringArray(innerProp.initializer)
        }

        if (propertyName === 'arrayField') {
          if (innerProp.initializer.kind === ts.SyntaxKind.NullKeyword) entry.arrayField = null
          else if (ts.isStringLiteral(innerProp.initializer)) entry.arrayField = innerProp.initializer.text
        }
      })

      results[categoryName] = entry
    })
  })

  return results
}

function diffArrays(a: string[], b: string[]): { missingInA: string[]; missingInB: string[] } {
  const setA = new Set(a)
  const setB = new Set(b)
  const missingInA = [...setB].filter(item => !setA.has(item))
  const missingInB = [...setA].filter(item => !setB.has(item))
  return { missingInA, missingInB }
}

function main() {
  const docMap = parseDocTable()
  const frontendMap = parseFrontendConfig()

  const mismatches: any[] = []
  const categories = Object.keys(CATEGORY_FIELD_CONFIG)

  for (const category of categories) {
    const config = CATEGORY_FIELD_CONFIG[category]
    const doc = docMap[category]
    const frontend = frontendMap[category]

    const configFields = config.requiredFields
    const docFields = doc?.fields || []
    const frontendFields = frontend?.keyFields || []

    const configVsDoc = diffArrays(configFields, docFields)
    const configVsFrontend = diffArrays(configFields, frontendFields)
    const docVsFrontend = diffArrays(docFields, frontendFields)

    const arrayConfig = Object.entries(config.fieldToDropdownMap)
      .filter(([key]) => !configFields.includes(key))
      .map(([key]) => key)
      .find(Boolean) || null
    const arrayDoc = doc?.arrayField || null
    const arrayFrontend = frontend?.arrayField ?? null

    const arrayMismatch = arrayConfig !== arrayDoc || arrayConfig !== arrayFrontend || arrayDoc !== arrayFrontend
    const hasFieldMismatch = configVsDoc.missingInA.length || configVsDoc.missingInB.length ||
      configVsFrontend.missingInA.length || configVsFrontend.missingInB.length ||
      docVsFrontend.missingInA.length || docVsFrontend.missingInB.length

    if (hasFieldMismatch || arrayMismatch) {
      mismatches.push({
        category,
        configFields,
        docFields,
        frontendFields,
        arrayFields: {
          config: arrayConfig,
          doc: arrayDoc,
          frontend: arrayFrontend
        },
        diffs: {
          configVsDoc,
          configVsFrontend,
          docVsFrontend
        }
      })
    }
  }

  if (mismatches.length > 0) {
    console.error('Field alignment audit failed:')
    console.error(JSON.stringify({
      totalCategories: categories.length,
      mismatchedCategories: mismatches.length,
      mismatches
    }, null, 2))
    process.exit(1)
  }

  console.log(`Field alignment audit passed for ${categories.length} categories.`)
}

main()
