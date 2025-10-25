export interface DistributionValue {
  value: string
  count: number
  percentage: number
  source: string
}

export interface DistributionData {
  mode: string
  values: DistributionValue[]
  totalReports: number
  dataSource: string
}

export type SolutionFieldMap = Record<string, unknown> & {
  [key: string]: unknown
}

export type AggregatedFieldMap = Record<string, unknown> & {
  [key: string]: unknown
}
