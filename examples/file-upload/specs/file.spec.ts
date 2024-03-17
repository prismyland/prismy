import { testServerManager } from '../../../specs/helpers'
import {
  ErrorResult,
  getPrismyContext,
  Middleware,
  prismy,
  Result,
} from '../../../src'
import { MultipartBodySelector } from './file'
import path from 'path'
import { File } from 'buffer'
import fs from 'fs'
import { nanoid } from 'nanoid'
import Formidable from 'formidable'

const testBoundary = `------test-boundary-${nanoid()}`
const testUploadRoot = path.join(process.cwd(), 'file-test-dest')

beforeAll(async () => {
  await testServerManager.start()
})

afterAll(async () => {
  await testServerManager.close()
  fs.rmSync(testUploadRoot, { recursive: true })
  fs.mkdirSync(testUploadRoot)
})

describe('MultipartBodySelector', () => {
  it('parse a file and a field (FormData)', async () => {
    const handler = MultipartTestHandler()

    const formData = new FormData()
    const fileBuffer = fs.readFileSync(
      path.join(process.cwd(), 'specs/dummyFiles/smallFile.txt'),
    )
    const fileBlob = new Blob([fileBuffer])
    const file = new File([fileBlob], 'smallFile.txt')
    formData.append('testFile', file)
    formData.append('testField', 'testValue')

    const response = await testServerManager.loadRequestListenerAndCall(
      handler,
      '/',
      {
        method: 'post',
        body: formData,
      },
    )

    expect(response).toMatchObject({
      statusCode: 200,
    })
    expect(JSON.parse(response.body)).toMatchObject({
      fields: {
        testField: 'testValue',
      },
      files: {
        testFile: [
          {
            filepath: expect.stringMatching(
              new RegExp(testUploadRoot + '/[A-z0-9]+'),
            ),
            mimetype: 'application/octet-stream',
            newFilename: expect.stringMatching('[A-z0-9]+'),
            originalFilename: 'smallFile.txt',
            size: file.size,
          },
        ],
      },
    })
  })

  it('parse a file and a field (Raw)', async () => {
    const handler = MultipartTestHandler()

    const response = await testServerManager.loadRequestListenerAndCall(
      handler,
      '/',
      {
        method: 'post',
        headers: {
          'content-type': `multipart/form-data; boundary=${testBoundary}`,
        },
        body: [
          '--' + testBoundary,
          'Content-Disposition: form-data; name="file_name_0"',
          '',
          'super alpha file',
          '--' + testBoundary,
          'Content-Disposition: form-data; ' +
            'name="upload_file_0"; filename="1k_a.dat"',
          'Content-Type: application/octet-stream',
          '',
          'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
          '--' + testBoundary + '--',
        ].join('\r\n'),
      },
    )

    expect(JSON.parse(response.body)).toMatchObject({
      fields: [
        {
          name: 'file_name_0',
          value: 'super alpha file',
          info: {
            encoding: '7bit',
            mimeType: 'text/plain',
            nameTruncated: false,
            valueTruncated: false,
          },
        },
      ],
      files: [
        {
          filePath: expect.stringMatching(
            new RegExp(
              `${testUploadRoot}/prismy-temp-dir-[A-z0-9_-]+/prismy-upload-[A-z0-9_-]+`,
            ),
          ),
          info: {
            encoding: '7bit',
            filename: '1k_a.dat',
            mimeType: 'application/octet-stream',
          },
          name: 'upload_file_0',
        },
      ],
    })
    expect(response).toMatchObject({
      statusCode: 200,
    })
  })

  it('throws when body is empty', async () => {
    const handler = MultipartTestHandler()

    const response = await testServerManager.loadRequestListenerAndCall(
      handler,
      '/',
      {
        method: 'post',
        headers: {
          'content-type': `multipart/form-data; boundary=${testBoundary}`,
        },
        body: '',
      },
    )

    expect(JSON.parse(response.body)).toMatchObject({
      error: expect.stringContaining('Error: Unexpected end of form'),
    })
    expect(response).toMatchObject({
      statusCode: 400,
    })
  })

  it('throws if field size hits limit', async () => {
    const handler = MultipartTestHandler({
      maxFileSize: 13,
      maxFieldsSize: 3,
    })

    const response = await testServerManager.loadRequestListenerAndCall(
      handler,
      '/',
      {
        method: 'post',
        headers: {
          'content-type': `multipart/form-data; boundary=${testBoundary}`,
        },
        body: [
          '--' + testBoundary,
          'Content-Disposition: form-data; name="file_name_0"',
          '',
          'super alpha file',
          '--' + testBoundary,
          'Content-Disposition: form-data; ' +
            'name="upload_file_0"; filename="1k_a.dat"',
          'Content-Type: application/octet-stream',
          '',
          'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
          '--' + testBoundary + '--',
        ].join('\r\n'),
      },
    )

    const jsonBody = JSON.parse(response.body)
    expect(jsonBody).toMatchObject({
      error: expect.stringContaining('Error: options.maxFieldsSize'),
    })
    expect(response).toMatchObject({
      statusCode: 413,
    })
  })
})

const errorDataMap = new WeakMap()
function MultipartTestHandler(options: Formidable.Options = {}) {
  const multipartBodySelector = MultipartBodySelector({
    uploadDir: testUploadRoot,
    ...options,
  })
  return prismy(
    [multipartBodySelector],
    (body) => {
      return Result(body)
    },
    [
      Middleware([], (next) => async () => {
        try {
          return await next()
        } catch (error: any) {
          const context = getPrismyContext()
          return ErrorResult(
            error.statusCode != null ? error.statusCode : 500,
            {
              error: error.stack,
              data: errorDataMap.get(context),
            },
          )
        }
      }),
    ],
  )
}
