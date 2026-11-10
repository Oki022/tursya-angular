import { Pipe, PipeTransform } from '@angular/core';
import { CATEGORIES } from './task.model';

/** {{ task.category | categoryName }} → "Почистване". Unknown ids are shown as they are. */
@Pipe({ name: 'categoryName' })
export class CategoryNamePipe implements PipeTransform {
  transform(id: string): string {
    return CATEGORIES[id] ?? id;
  }
}
