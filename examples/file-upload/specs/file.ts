import { getPrismyContext } from '../prismy'
import { createPrismySelector, PrismySelector } from './createSelector'
import { createError } from '../error'
import Formidable, { errors as formidableErrors, File } from 'formidable'

function createMultipartBodyReader<MVF extends string>(
  options: Formidable.Options & { multivaluedFields?: MVF[] } = {},
): () => Promise<{
  fields: Omit<{ [key: string]: undefined | string }, MVF> & {
    [key in MVF]: string[] | undefined
  }
  files: { [key: string]: File[] | undefined }
}> {
  return async () => {
    const context = getPrismyContext()
    const contentType = context.req.headers['content-type']
    if (!isContentTypeMultipart(contentType)) {
      throw createError(
        400,
        `Content type must be multipart/form-data. (Current: ${contentType})`,
      )
    }
    const { multivaluedFields = [], ...otherOptions } = options
    const form = Formidable(otherOptions)
    try {
      const [fields, files] = await form.parse(context.req)
      return {
        fields: Object.entries(fields).reduce(
          (obj, [key, value]) => {
            if (value == null) {
              return obj
            }
            if (multivaluedFields.indexOf(key as any) > -1) {
              obj[key] = value
            } else {
              obj[key] = value[0]
            }

            return obj
          },
          {} as Omit<{ [key: string]: undefined | string }, MVF> & {
            [key in MVF]: string[] | undefined
          },
        ),
        files,
      }
    } catch (error: any) {
      switch (error.code) {
        case formidableErrors.biggerThanMaxFileSize:
          throw createError(413, error.message, error)
      }
      console.log(error)
      throw error
    }
  }
}

export function MultipartBodySelector<MVF extends string>(
  options: Formidable.Options & { multivaluedFields?: MVF[] } = {},
): PrismySelector<{
  fields: Omit<{ [key: string]: undefined | string }, MVF> & {
    [key in MVF]: string[] | undefined
  }
  files: { [key: string]: File[] | undefined }
}> {
  return createPrismySelector(async () => {
    return createMultipartBodyReader(options)()
  })
}
export function MultipartBodyReaderSelector<MVF extends string>(
  options: Formidable.Options & { multivaluedFields?: MVF[] } = {},
): PrismySelector<
  () => Promise<{
    fields: Omit<{ [key: string]: undefined | string }, MVF> & {
      [key in MVF]: string[] | undefined
    }
    files: { [key: string]: File[] | undefined }
  }>
> {
  return createPrismySelector(async () => {
    return createMultipartBodyReader(options)
  })
}

function isContentTypeMultipart(contentType: string | undefined) {
  if (contentType == null) {
    return false
  }
  if (contentType.startsWith('multipart/form-data')) {
    return true
  }
  return false
}
