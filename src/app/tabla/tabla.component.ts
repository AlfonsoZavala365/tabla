import { AfterViewInit, Component, ComponentFactoryResolver, EventEmitter, Input, Output, ViewChild  } from '@angular/core';
import {  ShortcutInput,  KeyboardShortcutsComponent } from '@egoistdeveloper/ng-keyboard-shortcuts';
import * as FileSaver from 'file-saver';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { dPaginacion } from '../../interfaces/Common';
import { Paginador } from '../../interfaces/Paginador';
import { TokenService } from '../../services/interceptors/token.service';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'tabla-component',
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.css']
})
export class TablaComponent implements AfterViewInit   {
  @Input() dataSource: any[] = [];
  @Input() cols: any[] = [];  
  @Input() displayedColumns: string[] = [];
  @Input() ocultarPaginador: boolean = false;
  
  primeraFila: number = 0;
  filas: number =10; 
  ultimaFila!: number;   
  total_registros!: number;
  paginacion :dPaginacion | undefined;

  @Output() clave:EventEmitter<any> = new EventEmitter();
  @Output() elimina:EventEmitter<any> = new EventEmitter();
  @Output() activaDes:EventEmitter<any> = new EventEmitter();
  @Output() actualiza:EventEmitter<any> = new EventEmitter();
  @Output() nuevo:EventEmitter<any> = new EventEmitter();

  @Output() ejecutaConsulta: EventEmitter<any> = new EventEmitter();
  @Output() activarDesactivar: EventEmitter<any> = new EventEmitter();
  @Input() botonElimina: boolean = true;
  @Input() botonBloquea: boolean = false;
  @Input() botonEditar: boolean = true;
  @Input() ocultarAdd: boolean = false;
  
  

  @Input() PermisoEditar: boolean = true;  
  @Input() PermisoBloquear: boolean = true;    
  @Input() PermisoElimina: boolean = true;  
  @Input() columnaFoto: boolean = true;
  @Input() ocultarBotones: boolean = false;
  
  @Input() columOrder: string=''
  selectedBrowser : boolean= false;
  activado: boolean = true;
  desactivado: boolean = false;
  cargando: boolean = true;
  sinData: boolean = false;
  

  public colss: any[] =[];
  
  @ViewChild(KeyboardShortcutsComponent) keyboard!: KeyboardShortcutsComponent;
  @ViewChild('dt1') tabla!: Table;
  @ViewChild('pagina', {static: false}) paginator?: Paginator;
  
  public keyboardShortcuts: ShortcutInput[] = [];

  constructor(public tokenService: TokenService) {  
   }
  
  ngAfterViewInit(): void {  
   
    this.installKeyBindings();        
  }  

  private installKeyBindings(): void {
 
    this.keyboardShortcuts.push(
      {
        key: 'ctrl + n',
        preventDefault: true,         
        command: (e) => {
          this.nuevo.emit();
        },
      },
      {
        key: 'ctrl + a',
        preventDefault: true,         
        command: (e) => {
          this.actualiza.emit();
        },
      },
      {
        key: 'ctrl + e',
        preventDefault: true,         
        command: (e) => {
          this.exportExcel();
        },
      },
      {
         key: 'ctrl + l',
         preventDefault: true,         
         command: (e) => {
            this.clear(this.tabla);
         },
       },
    );
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(this.dataSource);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "products");
    });
}

saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
}

// {{rowData[col.field]}} = 'ACTIVO' ? 'p-button-text p-button-success p-mr-1' : 'p-button-text p-button-danger p-mr-1'"

activarDesactivar_click(data: any){
  this.activarDesactivar.emit(data);
}

filaSeleccionada(data: any){ 
  this.clave.emit(data);  
}

eliminaFila(data: any){ 
  this.elimina.emit(data);  
}

actualizar(){
  this.actualiza.emit();
}

nuevos(){
  this.nuevo.emit();
}


valoresResultado(dt: any[], x: any[], pag: Paginador ){     
  const total_filas = (x == undefined)? pag.total_filas : x[0].total_filas;
  const primerFila = (x == undefined)? pag.primerFila : x[0].primerFila ;
  if(dt !== undefined ){    
      this.dataSource = dt;         
      this.sinData = true;
      this.total_registros = total_filas;
      this.primeraFila = primerFila;      
      let pageCount: number = (this.paginator?.paginatorState.pageCount == undefined) ? 0: this.paginator?.paginatorState.pageCount;
      let paginasActual: number = (this.paginator?.paginatorState.rows == undefined) ? 0: this.paginator?.paginatorState.rows;
      let paginasCalculadas = Math.ceil((total_filas / paginasActual))
      
      if( ( this.total_registros <= this.filas && this.paginator?._page !== 0 ) 
      || paginasCalculadas < pageCount ){  
        this.paginator?.changePage(0); 
      }  
  }  
  if(dt.length == 0)  {
    this.sinData = false;
  }  
}

clear(table: Table) {  
  table.clear();   
   this.paginator?.changePage(0); 
}

activaDesactiva(data: any){ 
  this.activaDes.emit(data);  
}

paginate(event: any) {  
  this.ultimaFila =event.first + event.rows;  
  this.primeraFila = event.first;   
  this.paginacion = {
    filas :this.filas,
    primeraFila : this.primeraFila,
    ultimaFila : this.ultimaFila,  
    paginaActual : event.page
  }
  this.ejecutaConsulta.emit(this.paginacion)
  //event.first = Index of the first record
  //event.rows = Number of rows to display in new page
  //event.page = Index of the new page
  //event.pageCount = Total number of pages
}


}
