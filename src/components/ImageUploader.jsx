import { useRef, useState } from 'react'
import { ImageIcon } from './Icons.jsx'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

export default function ImageUploader({ images = [], onChange, error }) {
  const inputRef = useRef(null)
  const [fileError, setFileError] = useState('')

  const handleFiles = (files) => {
    setFileError('')
    const list = Array.from(files)
    const bad = list.find((f) => !ALLOWED.includes(f.type))
    if (bad) {
      setFileError(`${bad.name} is not allowed. Use JPG, PNG or WEBP.`)
      return
    }
    onChange([...images, ...list])
  }

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className={`image-uploader${error || fileError ? ' has-error' : ''}`}>
      <div className="image-grid">
        {images.map((img, i) => {
          const src = typeof img === 'string' ? img : URL.createObjectURL(img)
          const isFile = typeof img !== 'string'
          return (
            <div className="image-tile" key={isFile ? `file-${i}` : src}>
              <img src={src} alt={`Upload ${i + 1}`} />
              <button
                type="button"
                className="image-remove"
                aria-label="Remove image"
                onClick={() => removeImage(i)}
              >
                &times;
              </button>
            </div>
          )
        })}

        <button
          type="button"
          className="image-add"
          onClick={() => inputRef.current?.click()}
        >
          <ImageIcon size={22} />
          <span>Add images</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {(error || fileError) && <div className="field-error">{error || fileError}</div>}
      <p className="field-hint">Supports JPG, PNG and WEBP. Max 5 MB per image.</p>
    </div>
  )
}
