/**
 * Chrome DevTools MCP wrapper functions
 * Provides simplified interface to DevTools tools
 */

// NOTE: These functions will use the mcp__chrome-devtools__ tools
// They are typed here for reference but will be called via the MCP interface

export interface DevToolsHelpers {
  // Page management
  listPages(): Promise<PageInfo[]>
  selectPage(pageIdx: number): Promise<void>
  navigateTo(url: string, timeout?: number): Promise<void>
  newPage(url: string): Promise<number>
  closePage(pageIdx: number): Promise<void>

  // Snapshots and screenshots
  takeSnapshot(): Promise<SnapshotElement[]>
  takeScreenshot(options?: ScreenshotOptions): Promise<string>

  // Element interactions
  click(uid: string, dblClick?: boolean): Promise<void>
  fill(uid: string, value: string): Promise<void>
  fillForm(elements: FormElement[]): Promise<void>
  hover(uid: string): Promise<void>

  // Waiting
  waitFor(text: string, timeout?: number): Promise<void>
  waitForTimeout(ms: number): Promise<void>

  // Network monitoring
  listNetworkRequests(filters?: NetworkFilters): Promise<NetworkRequest[]>
  getNetworkRequest(url: string): Promise<NetworkRequest>

  // JavaScript execution
  evaluateScript(fn: string, args?: ElementArg[]): Promise<any>

  // Console
  listConsoleMessages(): Promise<ConsoleMessage[]>
}

export interface PageInfo {
  index: number
  title: string
  url: string
  isSelected: boolean
}

export interface SnapshotElement {
  uid: string
  tag: string
  text?: string
  attributes?: Record<string, string>
  children?: SnapshotElement[]
}

export interface ScreenshotOptions {
  uid?: string // specific element
  fullPage?: boolean
  filePath?: string
  format?: 'png' | 'jpeg' | 'webp'
  quality?: number
}

export interface FormElement {
  uid: string
  value: string
}

export interface NetworkFilters {
  resourceTypes?: string[]
  pageIdx?: number
  pageSize?: number
}

export interface NetworkRequest {
  url: string
  method: string
  statusCode: number
  responseBody?: string
  requestHeaders?: Record<string, string>
  responseHeaders?: Record<string, string>
}

export interface ElementArg {
  uid: string
}

export interface ConsoleMessage {
  type: 'log' | 'warn' | 'error' | 'info'
  text: string
  timestamp: string
}

/**
 * Smart wait - waits for element to appear with text
 */
export async function waitForElement(
  text: string,
  timeout: number = 10000
): Promise<void> {
  // This will use mcp__chrome-devtools__wait_for
  console.log(`Waiting for element with text: "${text}"`)
}

/**
 * Find element UID by text content
 */
export async function findElementByText(
  snapshot: SnapshotElement[],
  text: string,
  options?: { exact?: boolean; tag?: string }
): Promise<string | null> {
  const exact = options?.exact ?? false
  const tag = options?.tag

  function search(elements: SnapshotElement[]): string | null {
    for (const el of elements) {
      // Check if tag matches (if specified)
      if (tag && el.tag !== tag) {
        if (el.children) {
          const found = search(el.children)
          if (found) return found
        }
        continue
      }

      // Check text match
      if (el.text) {
        const matches = exact
          ? el.text === text
          : el.text.toLowerCase().includes(text.toLowerCase())

        if (matches) return el.uid
      }

      // Search children
      if (el.children) {
        const found = search(el.children)
        if (found) return found
      }
    }
    return null
  }

  return search(snapshot)
}

/**
 * Find all elements by attribute
 */
export function findElementsByAttribute(
  snapshot: SnapshotElement[],
  attributeName: string,
  attributeValue?: string
): SnapshotElement[] {
  const results: SnapshotElement[] = []

  function search(elements: SnapshotElement[]) {
    for (const el of elements) {
      if (el.attributes && attributeName in el.attributes) {
        if (!attributeValue || el.attributes[attributeName] === attributeValue) {
          results.push(el)
        }
      }
      if (el.children) {
        search(el.children)
      }
    }
  }

  search(snapshot)
  return results
}

/**
 * Check if element exists in snapshot
 */
export function elementExists(snapshot: SnapshotElement[], uid: string): boolean {
  function search(elements: SnapshotElement[]): boolean {
    for (const el of elements) {
      if (el.uid === uid) return true
      if (el.children && search(el.children)) return true
    }
    return false
  }

  return search(snapshot)
}

/**
 * Safe screenshot with retry
 */
export async function takeScreenshotSafe(
  options?: ScreenshotOptions,
  retries: number = 3
): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      // This will use mcp__chrome-devtools__take_screenshot
      console.log(`Taking screenshot (attempt ${i + 1}/${retries})`)
      return `screenshot-${Date.now()}.png`
    } catch (error) {
      if (i === retries - 1) {
        console.error('Failed to take screenshot after retries:', error)
        return null
      }
      await new Promise(r => setTimeout(r, 1000))
    }
  }
  return null
}

/**
 * Log console errors
 */
export function logConsoleErrors(messages: ConsoleMessage[]): string[] {
  return messages
    .filter(m => m.type === 'error')
    .map(m => `[${m.timestamp}] ${m.text}`)
}
