import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import * as TE from "fp-ts/TaskEither"
import { type TaskEither } from "fp-ts/TaskEither"
import { pipe } from "fp-ts/lib/function"

const toAxiosError = (cause: unknown): Error => new Error(`${cause}`, { cause })

const toResponseData = <D, C>(response: AxiosResponse<D, C>): D => response.data

export const httpGet = <D>(url: string, config?: AxiosRequestConfig<D>): TaskEither<Error, D> =>
  pipe(
    TE.tryCatch(() => axios.get(url, config), toAxiosError),
    TE.map(toResponseData)
  )

export const httpPost = <PD, RD>(url: string, data?: PD, config?: AxiosRequestConfig<PD>): TaskEither<Error, RD> =>
  pipe(
    TE.tryCatch(() => axios.post(url, data, config), toAxiosError),
    TE.map(toResponseData)
  )
