import * as React from 'react'
import {IInputs} from "../generated/ManifestTypes";
import RichTextEditor from './RichTextEditor';

const App = ({context}: {context: ComponentFramework.Context<IInputs>}) => {
  return (
    <div>
      <RichTextEditor placeholder={''} />
    </div>
  )
}

export default App
