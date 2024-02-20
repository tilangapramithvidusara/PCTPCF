import * as React from 'react'
import {IInputs} from "../generated/ManifestTypes";
import RichTextEditor from './RichTextEditor';

const App = ({context}: {context: ComponentFramework.Context<IInputs>}) => {
  console.log("Trigger 2")
  return (
    <div>
      <RichTextEditor placeholder={''} />
    </div>
  )
}

export default App
