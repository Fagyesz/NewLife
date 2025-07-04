import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reverseName',
  standalone: true
})
export class ReverseNamePipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '';
    const parts = value.trim().split(/\s+/);
    if (parts.length <= 1) return value;
    const last = parts.pop();
    return `${last} ${parts.join(' ')}`.trim();
  }
} 