import React, { createRef, useState } from 'react'
import ToolPage from '@theme/ToolPage'
import { Decoder, Stream } from '@garmin-fit/sdk'
import {
  GarminDiveGas,
  GarminDiveSettings,
  GarminSession,
  GarminSport,
} from '@site/src/components/pages/Tools/SsiDiveLogHelper/data'

interface GarminMessages {
  fileIdMesgs: { timeCreated: Date }[]
  sportMesgs: GarminSport[]
  diveSettingsMesgs: GarminDiveSettings[]
  diveGasMesgs: GarminDiveGas[]
  sessionMesgs: GarminSession[]
}

interface DiveData {
  [key: string]: string
}

const interestingMessages = [
  'fileIdMesgs',
  'sportMesgs',
  'diveSettingsMesgs',
  'diveGasMesgs',
  'sessionMesgs',
  'recordMesgs',
  'tankSummaryMesgs',
]

const SsiDiveLogHelper = (): JSX.Element => {
  const fileInputRef = createRef<HTMLInputElement>()
  const [messages, setMessages] = useState<GarminMessages | null>(null)
  const [dive, setDive] = useState<DiveData | null>(null)
  const [diveQR, setDiveQR] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [firstName, setFirstName] = useState<string>()
  const [lastName, setLastName] = useState<string>()

  const onUploadFile = async (): Promise<void> => {
    // Select file
    const file = fileInputRef.current?.files[0]
    if (!file) return setError('No file selected.')

    // Read file
    const buffer = await file.arrayBuffer()
    const stream = Stream.fromByteArray(buffer)
    const decoder = new Decoder(stream)

    // Check integrity
    if (!decoder.isFIT(stream)) return setError('Unable to parse FIT file')
    if (!decoder.checkIntegrity()) return setError('Integrity check failed')

    // Check for errors
    const { messages, errors } = decoder.read({
      // convertTypesToStrings: false,
      includeUnknownData: false,
      mergeHeartRates: true,
    })
    if (errors.length >= 1) return setError(errors.join(','))

    // Update messages
    setMessages(messages)
    setError(null)

    await parseDive(messages)
  }

  const formatDate = (date: Date): string => {
    const pad = (num: number, size: number): string => ('0'.repeat(size) + num).slice(-size)

    const year = pad(date.getFullYear(), 4)
    const month = pad(date.getMonth() + 1, 2)
    const day = pad(date.getDate(), 2)
    const hours = pad(date.getHours(), 2)
    const minutes = pad(date.getMinutes(), 2)

    return `${year}${month}${day}${hours}${minutes}`
  }

  const parseDive = async (messages): Promise<void> => {
    // Todo - Map the rest of Garmin data to SSI data
    const dive = {
      dive: null,
      noid: null,
      dive_type: '0',
      // divetime:33;
      datetime: formatDate(messages.sessionMesgs[0].startTime),
      // depth_m:13.5;
      // site:80095;
      // var_weather_id:2;
      // var_entry_id:21;
      // var_water_body_id:15;
      // var_watertype_id:4;
      // var_current_id:6;
      // var_surface_id:10;
      // var_divetype_id:23;
      // user_master_id:3679373; // Added if created from SSI app, seemingly not useful for importing
      user_firstname: firstName, // Added if created from SSI app, seemingly not useful for importing
      user_lastname: lastName, // Added if created from SSI app, seemingly not useful for importing
      // watertemp_c:16 ;
      // airtemp_c:20;
      // vis_m:3;
    }
    setDive(dive)
    setDiveQR(
      Object.entries(dive)
        .map(([key, value]) => (null === value ? key : `${key}:${value}`))
        .join(';'),
    )
  }

  return (
    <ToolPage title="SSI DiveLog helper">
      <div>
        <ul>
          <li>Upload your garmin .fit file</li>
          <li>Scan the resulting QR code in the SSI app</li>
          <li>Correct any details and save dive</li>
        </ul>

        <div>
          <label htmlFor="firstName" style={{ display: 'inline-block' }}>
            <span style={{ display: 'block' }}>First name:</span>
            <input
              style={{ padding: 4, margin: '0 4px 4px 0', fontSize: '125%', width: 200 }}
              type="text"
              id="firstName"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </label>
          <label htmlFor="lastName" style={{ display: 'inline-block' }}>
            <span style={{ display: 'block' }}>Last name:</span>
            <input
              style={{ padding: 4, margin: '0 4px 4px 0', fontSize: '125%', width: 200 }}
              type="text"
              id="lastName"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </label>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="*.fit"
          style={{ display: 'none' }}
          onInput={onUploadFile}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{ padding: '8px 16px' }}
        >
          Select file
        </button>

        {error && <p style={{ display: 'inline-block', paddingLeft: 16, color: 'red' }}>{error}</p>}
      </div>

      {dive && (
        <>
          <div>
            <br />
            <h2>Key information</h2>
            <p>{diveQR}</p>
            <img
              alt="Dive QR code for scanning in SSI app"
              src={`https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${diveQR}&cho=UTF-8`}
            />
          </div>
        </>
      )}

      {messages && (
        <div>
          <br />
          <h2>Inspect messages</h2>
          {Object.keys(messages).map((key) => (
            <details key={key}>
              <summary
                style={{ cursor: 'pointer', opacity: interestingMessages.includes(key) ? 1 : 0.5 }}
              >
                {key}
              </summary>
              <code>
                <pre>{JSON.stringify(messages[key], null, 2)}</pre>
              </code>
            </details>
          ))}
        </div>
      )}
    </ToolPage>
  )
}

export default SsiDiveLogHelper