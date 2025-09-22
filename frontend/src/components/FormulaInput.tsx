import { useEffect, useState } from 'react';
import katex from 'katex';

interface FormulaInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const QUICK_BUTTONS = [
  { label: '∫', insert: '\\int ' },
  { label: 'eˣ', insert: 'e^{x}' },
  { label: '√', insert: '\\sqrt{}' },
  { label: 'dy/dx', insert: '\\frac{dy}{dx}' },
];

export function FormulaInput({ value, onChange, placeholder, disabled }: FormulaInputProps) {
  const [preview, setPreview] = useState('');

  useEffect(() => {
    try {
      const html = katex.renderToString(value || '\\text{}', {
        throwOnError: false,
      });
      setPreview(html);
    } catch (error) {
      setPreview('<span class="text-slate-600">Не удалось отобразить формулу</span>');
    }
  }, [value]);

  const append = (snippet: string) => {
    if (disabled) return;
    onChange(`${value}${snippet}`);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {QUICK_BUTTONS.map((button) => (
          <button
            key={button.label}
            type="button"
            onClick={() => append(button.insert)}
            className="rounded bg-slate-200 px-3 py-1 text-sm text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-50 dark:hover:bg-slate-600"
          >
            {button.label}
          </button>
        ))}
      </div>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-32 w-full rounded-md border border-slate-300 bg-white p-3 font-mono text-sm shadow-sm focus:border-primary focus:outline-none dark:border-slate-600 dark:bg-slate-800"
      />
      <div className="rounded-md border border-dashed border-slate-300 p-3 dark:border-slate-700">
        <span className="text-xs uppercase tracking-wide text-slate-500">Предпросмотр</span>
        <div className="mt-2 min-h-[2rem]" dangerouslySetInnerHTML={{ __html: preview }} />
      </div>
    </div>
  );
}
