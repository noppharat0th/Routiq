import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DeviceAliasEditorProps {
  alias: string;
  deviceName: string;
  onSave: (alias: string) => void;
}

export function DeviceAliasEditor({ alias, deviceName, onSave }: DeviceAliasEditorProps) {
  const [value, setValue] = useState(alias);

  useEffect(() => setValue(alias), [alias]);

  return (
    <div className="flex w-full max-w-sm gap-2">
      <Input
        aria-label={`Local name for ${deviceName}`}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSave(value);
        }}
        placeholder="Local device name"
        value={value}
      />
      <Button
        disabled={value.trim() === alias}
        onClick={() => onSave(value)}
        type="button"
        variant="outline"
      >
        Save
      </Button>
    </div>
  );
}
