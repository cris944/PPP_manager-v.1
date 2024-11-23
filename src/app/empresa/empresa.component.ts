import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Empresa } from '../models/empresa';
import { EmpresaService } from '../services/empresa.service';
import { MenuItem, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empresa',
  standalone: true,
  templateUrl: './empresa.component.html',
  imports: [ButtonModule,ToastModule,ToolbarModule,FileUploadModule,TableModule, ButtonModule, DialogModule, RouterModule, InputTextModule,
    FormsModule, ConfirmDialogModule,SplitButtonModule,MatButtonModule,MatMenuModule,MatIconModule],
  styleUrls: ['./empresa.component.css'],
  
})
export class EmpresaComponent {
  empresas: Empresa[] = [];
  selectedEmpresas: Empresa[] = [];
  deleteEmpresaDialog: boolean = false;
  deleteEmpresasDialog: boolean = false;
  visible: boolean = false;
  empresa: Empresa = new Empresa();
  titulo: string = '';
  opc: string = '';
  op: number = 0;
  menuItems: MenuItem[] = [];

  @ViewChild('dt') dt: Table | undefined;

  constructor(
    private empresaService: EmpresaService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.listarEmpresas();
    this.menuItems = [
      {
        label: 'Importar',
        icon: 'pi pi-file-import',
        command: () => this.importFile(),
      },
      {
        label: 'Exportar',
        icon: 'pi pi-upload',
        command: () => this.exportData(),
      },
    ];
  }

  listarEmpresas() {
    this.empresaService.getEmpresas().subscribe(
      (data) => {
        this.empresas = data;
        console.log(this.empresas);
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al cargar empresas',
          detail: error.message || 'Error al cargar las empresas',
        });
      }
    );
  }

  showDialogCreate() {
    this.titulo = 'Crear Empresa';
    this.opc = 'Guardar';
    this.op = 0;
    this.empresa = new Empresa();
    this.visible = true;
  }

  showDialogEdit(id: number) {
    this.titulo = 'Editar Empresa';
    this.opc = 'Editar';
    this.empresaService.getEmpresasById(id).subscribe(
      (data) => {
        this.empresa = { ...data };
        this.op = 1;
        this.visible = true;
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al cargar la empresa',
          detail: error.message || 'No se pudo cargar la empresa',
        });
      }
    );
  }

  showDialogDelete(empresa: Empresa): void {
    this.empresa = { ...empresa };
    this.deleteEmpresaDialog = true;
  }

  deleteSelectedEmpresas(): void {
    this.deleteEmpresasDialog = true;
  }

  confirmDeleteSelected(): void {
    const idsToDelete = this.selectedEmpresas.map((empresa) => empresa.id);

    this.empresaService.deleteEmpresasBatch(idsToDelete).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Correcto',
          detail: response.message || 'Empresas eliminadas exitosamente.',
        });
        this.listarEmpresas();
        this.selectedEmpresas = [];
        this.deleteEmpresasDialog = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.details || 'No se pudieron eliminar las empresas.',
        });
      },
    });
  }

  deleteEmpresa(id: number) {
    this.empresaService.deleteEmpresa(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Correcto',
          detail: 'Empresa eliminada',
        });
        this.listarEmpresas();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar la empresa: ' + error.message,
        });
      },
    });
  }

  opcion() {
    if (this.op === 0) {
      this.addEmpresa();
    } else if (this.op === 1) {
      this.editEmpresa();
    }
  }

  addEmpresa() {
    this.empresaService.createEmpresa(this.empresa).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Correcto',
          detail: 'Empresa Registrada',
        });
        this.listarEmpresas();
        this.visible = false;
        this.empresa = new Empresa();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo agregar la empresa: ' + error.message,
        });
      },
    });
  }

  editEmpresa() {
    this.empresaService.updateEmpresa(this.empresa, this.empresa.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Correcto',
          detail: 'Empresa Editada Correctamente',
        });
        this.listarEmpresas();
        this.visible = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo editar la empresa: ' + error.message,
        });
      },
    });
  }

  limpiar() {
    this.titulo = '';
    this.opc = '';
    this.op = 0;
    this.empresa = new Empresa();
    this.visible = false;
  }

  confirmDelete(empresa: Empresa): void {
    if (!empresa || !empresa.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo encontrar la empresa para eliminar.',
      });
      return;
    }

    this.empresaService.deleteEmpresa(empresa.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Correcto',
          detail: `Empresa ${empresa.razon_social} eliminada exitosamente.`,
        });
        this.listarEmpresas();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudo eliminar la empresa: ${error.message}`,
        });
      },
    });

    this.deleteEmpresaDialog = false;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onSelectionChange(): void {
    this.cdr.detectChanges();
  }
  importFile() {
    
    console.log('Importar archivo');
  }
  
  exportData() {
    if (this.dt) {
      this.dt.exportCSV();
    } else {
      console.error('La referencia a la tabla no está definida.');
    }
  }
}
