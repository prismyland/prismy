import { MultipartBodySelector } from '../../../src/selectors/file'
import { expectType } from '../../../specs/helpers'

const selector = MultipartBodySelector({ multivaluedFields: ['hello'] })
const body = await selector.resolve()
expectType<string[] | undefined>(body.fields.hello)
expectType<string | undefined>(body.fields.noHello)
