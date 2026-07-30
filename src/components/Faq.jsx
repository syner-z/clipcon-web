import { useState } from 'react'
import Icon from './Icon.jsx'
import { faqItems } from '../data.js'

export default function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <div className="faq-list">
      {faqItems.map((item, index) => (
        <div className={`faq-item ${open === index ? 'open' : ''}`} key={item.question}>
          <button type="button" onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}>
            <span>{item.question}</span>
            <i><Icon name="chevron" size={20} /></i>
          </button>
          <div className="faq-answer"><p>{item.answer}</p></div>
        </div>
      ))}
    </div>
  )
}
