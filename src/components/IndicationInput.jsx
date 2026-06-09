import { EXAM_INDICATIONS } from '../data/exams'

// <datalist> combobox — shows exam-specific suggestions but accepts any free text.
export default function IndicationInput({ examType, value, onChange, className }) {
  const listId = `ind-${examType.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`
  return (
    <>
      <input
        list={listId}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Select or type a clinical indication..."
        className={className}
      />
      <datalist id={listId}>
        {(EXAM_INDICATIONS[examType] ?? []).map(ind => (
          <option key={ind} value={ind} />
        ))}
      </datalist>
    </>
  )
}
