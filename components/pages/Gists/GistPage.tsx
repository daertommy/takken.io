import React from 'react'
import DefaultLayout from '@/components/layout/DefaultLayout'
import { Gist } from '@/core/services/GitHub'
import CodeEditor from '@/components/markdown/components/CodeEditor'
import { Language } from 'prism-react-renderer'
import { isLanguageSupported } from '@/components/markdown/components/supportedLanguages'
import { slugify } from '@/core/utils/slugify'

interface Props {
  gist: Gist
}

const mapGitHubLanguageToSupportedLanguage = (rawLanguage): Language => {
  const language = slugify(rawLanguage)

  if (isLanguageSupported(language)) return language as Language
  if (language.startsWith('git')) return 'git'

  return undefined
}

const GistPage = ({ gist }: Props) => {
  const { created_at, updated_at } = gist
  const createdDate = new Date(created_at).toDateString()
  const updatedDate = new Date(updated_at).toDateString()

  return (
    <DefaultLayout>
      {Object.values(gist.files).map((file, index) => {
        const { language } = file

        return (
          <>
            {index === 0 ? <h1>{file.filename}</h1> : <h2>{file.filename}</h2>}

            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingTop: '1em' }}>
              <sup>Created on {createdDate}</sup>
              <sup>Last updated on {updatedDate}</sup>
            </div>

            <CodeEditor code={file.content} language={mapGitHubLanguageToSupportedLanguage(language)} />
          </>
        )
      })}
    </DefaultLayout>
  )
}

export default GistPage
