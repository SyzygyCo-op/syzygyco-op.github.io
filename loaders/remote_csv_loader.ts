import type { Loader } from "astro/loaders"
import { z } from "astro:content"
import * as csv from 'csv-parse'
import fs from 'fs'

interface RemoteCSVLoaderProps {
    url: string
    delimiter: string
    fieldTypes: FieldTypes
}

interface StringType {
    type: 'string'
}

interface BoolType {
    type: 'boolean'
    trueValues?: Set<string>
    falseValues?: Set<string>
}

type FieldType = StringType | BoolType

export interface FieldTypes {
    [fieldName: string]: FieldType | undefined
}

async function parseCsv(
    csvText: string,
    delimiter: string,
    fieldTypes: FieldTypes = {},
): Promise<any[][]> {
    const records: any[] = []
    const parser = csv.parse(csvText, {
        delimiter,
        escape: '"',
    })
    for await (const record of parser) {
        records.push(record)
    }
    return records
}

function applyFieldTypes(fieldTypes: FieldTypes, record: Partial<Record<string, string>>): Partial<Record<string, any>> {
    const newRecord: Partial<Record<string, any>> = {
        ...record,
    }
    for (const fieldName in fieldTypes) {
        const stringValue = record[fieldName]
        if (stringValue === undefined) continue
        const fieldType = fieldTypes[fieldName]
        if (fieldType) {
            switch (fieldType.type) {
                case 'boolean':
                    if (fieldType.trueValues?.has(stringValue) === true) {
                        newRecord[fieldName] = true
                    } else if (fieldType.falseValues?.has(stringValue) === true) {
                        newRecord[fieldName] = false
                    } else {
                        newRecord[fieldName] = stringValue.length !== 0
                    }
                    break
                default:
                    newRecord[fieldName] = stringValue
                    break
            }
        }
    }
    return newRecord
}

export function remoteCSVLoader({
    url,
    delimiter = ',',
    fieldTypes = {},
}: RemoteCSVLoaderProps): Loader {
    return {
        name: 'remote-csv-loader',
        load: async ({ store, logger, parseData, meta, generateDigest }) => {
            logger.info(`Fetching sheet: ${url}`)
            const res = await fetch(url)
            logger.debug(`Getting sheet blob.`)
            const csvBlob = await res.blob()
            logger.debug(`Getting sheet text.`)
            const csvText = await csvBlob.text()
            logger.info(`Parsing CSV:\n${csvText}`)
            const records = await parseCsv(csvText, delimiter, fieldTypes)
            if (records.length <= 0) throw Error('Remote CSV file is empty!')
            logger.debug(`Inferring columns.`)
            const columns = records.shift()
            if (columns === undefined || columns.length <= 0) throw Error('Remote CSV file is empty')
            store.clear()
            for (let row = 0; row < records.length; row++){
                const id = row.toString()
                const record = records[row]
                const unvalidatedData: Partial<Record<string, string>> = {}
                for (let col = 0; col < columns.length; col++) {
                    const column = columns[col]
                    unvalidatedData[column] = record[col]
                }
                const typedUnvalidatedData = applyFieldTypes(fieldTypes, unvalidatedData)
                logger.info(`TypedData: ${JSON.stringify(typedUnvalidatedData, null, 2)}`)
                console.log(JSON.stringify(typedUnvalidatedData, null, 2))
                const parsedData = await parseData({
                    id,
                    data: typedUnvalidatedData,
                })
                if (!isObjectEmpty(parsedData)) {
                    const actualId = (parsedData['id'] ?? parsedData['Id'] ?? id)
                    store.set({
                        id: actualId,
                        data: parsedData,
                    })
                }
            }
        },
    }
}

function isObjectEmpty(obj: Record<keyof any, any>): boolean {
    for (const k of Object.keys(obj)) {
        if (obj[k] !== null && obj[k] !== undefined) return false
    }
    return true
}
