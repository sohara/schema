import { Buffer } from "../buffer";
import formatter, { Formatter } from "../formatter";
import { Label, Optionality, PrimitiveLabel } from "../label";
import { Position, ReporterDelegate } from "../reporter";

const delegate: ReporterDelegate<Buffer, string, void> = {
  openSchema() {
    return `{\n`;
  },
  closeSchema() {
    return `}`;
  },

  emitKey({ key, nesting }): string {
    return `${pad(nesting * 2)}${key}: `;
  },

  closeDictionary({ buffer, nesting, optionality }): string | void {
    buffer.push(`${pad(nesting * 2)}})`);

    if (optionality === Optionality.Required) {
      buffer.push(".required()");
    }
  },

  closeValue({ position }): string | void {
    if (position === Position.First || position === Position.Middle) {
      return ",\n";
    } else if (position === Position.Last) {
      return "\n";
    }
  },

  closeList(): string {
    return ")";
  },

  openDictionary(): string {
    return `Dictionary({\n`;
  },
  openList(): string {
    return "List(";
  },
  emitPrimitive({ label }): string {
    return formatType(label);
  }
};

function formatType(label: Label<PrimitiveLabel>) {
  let { name, args } = label.type.schemaType;
  let out = `${name}(${args.join(", ")})`;

  if (label.optionality === Optionality.Required) {
    out += `.required()`;
  }

  return out;
}

function pad(size: number): string {
  return " ".repeat(size);
}

export const schemaFormat: Formatter<void> = formatter(delegate, Buffer);
