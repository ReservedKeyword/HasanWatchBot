export type Channel = Readonly<{
  id: string
  name: string
  game?: {
    id: string
    name: string
  }
  stream?: {
    archiveVideo?: { id: string; status?: string; title?: string }
    id: string
    type?: string
    viewersCount?: number
  }
  url: string
}>

export type ChannelResponse = Readonly<{ channel?: Channel }>

export type PlaybackAccessToken = Readonly<{ signature: string; value: { vod_id: string } }>

export type PlaybackAccessTokenResponse = Readonly<{ videoPlaybackAccessToken?: PlaybackAccessToken }>
