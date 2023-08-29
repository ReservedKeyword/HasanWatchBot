import * as O from "fp-ts/Option"
import * as TE from "fp-ts/TaskEither"
import { type TaskEither } from "fp-ts/TaskEither"
import { pipe } from "fp-ts/function"
import { httpGet, httpPost } from "./axios"
import { CHANNEL_QUERY, PLAYBACK_ACCESS_TOKEN } from "./gql-queries"
import type { Channel, ChannelResponse, PlaybackAccessToken, PlaybackAccessTokenResponse } from "./types/twitch"

const FETCH_PLAYLISTS_URL = (videoId: string) => `http://usher.ttvnw.net/vod/${videoId}`
const TWITCH_CLIENT_ID = "kd1unb4b3q4t58fwlpcbzcbnm76a8fp"
const TWITCH_GQL_URL = "https://gql.twitch.tv/gql"

const toChannelNotFoundError = (name: string): Error => new Error(`Channel ${name} was not found`)

const toNoActiveStreamError = (channelName: string): Error =>
  new Error(`Channel ${channelName} does not have an active stream video`)

const toNoPlaybackAccessTokenError = (videoId: string): Error =>
  new Error(` Did not receive playback access token for video ID ${videoId}`)

const toGQLDataErrors = <A = any>(data: any): TaskEither<Error, A> =>
  data.errors?.length > 0
    ? TE.left(new Error(`Twitch (GQL) Error(s): ${JSON.stringify(data.errors)}`))
    : TE.right(data as A)

const toPlaybackAccessToken = (data: any): PlaybackAccessToken => ({
  signature: data.signature,
  value: JSON.parse(data.value),
})

export const getChannel = (name: string): TaskEither<Error, Channel> =>
  pipe(
    CHANNEL_QUERY(name),
    (query) => gqlQuery<ChannelResponse>(query),
    TE.chain((response) =>
      pipe(
        O.fromNullable(response.channel),
        TE.fromOption(() => toChannelNotFoundError(name))
      )
    )
  )

export const getStreamVideoId = (channel: Channel): TaskEither<Error, string> =>
  pipe(
    O.fromNullable(channel.stream?.archiveVideo?.id),
    TE.fromOption(() => toNoActiveStreamError(channel.name))
  )

export const getPlaybackAccessToken = (videoId: string): TaskEither<Error, PlaybackAccessToken> =>
  pipe(
    PLAYBACK_ACCESS_TOKEN(videoId),
    (query) => gqlQuery<PlaybackAccessTokenResponse>(query),
    TE.chain((response) =>
      pipe(
        O.fromNullable(response.videoPlaybackAccessToken),
        O.map(toPlaybackAccessToken),
        TE.fromOption(() => toNoPlaybackAccessTokenError(videoId))
      )
    )
  )

export const getPlaylistsFromManifest = (playbackAccessToken: PlaybackAccessToken): TaskEither<Error, string> =>
  httpGet(FETCH_PLAYLISTS_URL(playbackAccessToken.value.vod_id), {
    params: {
      allow_source: true,
      nauth: JSON.stringify(playbackAccessToken.value),
      nauthsig: playbackAccessToken.signature,
      player: "twitchweb",
    },
  })

export const gqlQuery = <A>(query: string): TaskEither<Error, A> =>
  pipe(
    httpPost(TWITCH_GQL_URL, { query }, { headers: { "Client-ID": TWITCH_CLIENT_ID } }),
    TE.chain(toGQLDataErrors),
    TE.map((response) => response.data)
  )
