import React, { CSSProperties, Fragment, useMemo, useState } from 'react'
import Editor from 'react-simple-code-editor'
import Highlight, { defaultProps, Language } from 'prism-react-renderer'
import theme from 'prism-react-renderer/themes/dracula'
import cx from 'classnames'

import classes from './CodeBlockAndEditor.module.scss'
import { isLanguageSupported } from '@site/src/components/common/supportedLanguages'

interface OnChangeFn {
  (input: string): void
}

interface CodeEditorProps {
  code: string
  className?: string
  onChange?: OnChangeFn
  language?: string
}

const defaultLanguage: Language = 'jsx'

const CodeEditor = ({
  code = '',
  className,
  onChange,
  language = defaultLanguage,
}: CodeEditorProps) => {
  const [value, setValue] = useState<string>(code)

  const usedLanguage = useMemo((): Language => {
    if (isLanguageSupported(language)) return language as Language
    if (language === 'yml') return 'yaml'
    return defaultLanguage
  }, [language])

  const onChangeHandler = (value) => {
    setValue(value)
    onChange?.(value)
  }

  const highlight = (code) => (
    <Highlight {...defaultProps} theme={theme} code={code} language={usedLanguage}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <Fragment>
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </Fragment>
      )}
    </Highlight>
  )

  return (
    <Editor
      value={value}
      onValueChange={onChangeHandler}
      highlight={highlight}
      padding={10}
      className={cx(classes.container, className)}
      style={theme.plain as CSSProperties}
    />
  )
}

export default CodeEditor
