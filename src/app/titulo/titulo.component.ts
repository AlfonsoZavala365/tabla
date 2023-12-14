import { Component, Input } from '@angular/core';

@Component({
  selector: 'titulo-component',
  templateUrl: './titulo.component.html',
  styleUrls: ['./titulo.component.css']
})
export class TituloComponent {
  @Input() icono: string = '';
  @Input() titulo: string = '';


  constructor() { }

  ngOnInit(): void {
  }

}
