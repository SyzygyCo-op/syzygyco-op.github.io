import type { Loader } from "astro/loaders"
import { z } from "astro:content"
import * as csv from 'csv-parse'
import fs from 'fs'

interface RemoteCSVLoaderProps {
    url: string
    delimiter: string
}

async function parseCsv(
    csvText: string,
    delimiter: string,
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

export function remoteCSVLoader({
    url,
    delimiter = ',',
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
            const records = await parseCsv(csvText, delimiter)
            if (records.length <= 0) throw Error('Remote CSV file is empty!')
            logger.debug(`Inferring columns.`)
            const columns = records.shift()
            if (columns === undefined || columns.length <= 0) throw Error('Remote CSV file is empty')
            store.clear()
            for (let row = 0; row < records.length; row++){
                const id = row.toString()
                const record = records[row]
                const unvalidatedData: any = {}
                for (let col = 0; col < columns.length; col++) {
                    const column = columns[col]
                    unvalidatedData[column] = record[col]
                }
                const parsedData = await parseData({
                    id,
                    data: unvalidatedData,
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
