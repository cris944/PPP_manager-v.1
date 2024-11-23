import { Component, ViewChild } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { Persona } from '../models/persona';
import { PersonaService } from '../services/persona.service';
import { MenuItem, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ChangeDetectorRef } from '@angular/core'
import { FormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';



@Component({
  selector: 'app-persona',
  standalone: true,
  imports: [ButtonModule,ToastModule,ToolbarModule,FileUploadModule,TableModule, ButtonModule, DialogModule, RouterModule, InputTextModule,
    FormsModule, ConfirmDialogModule,SplitButtonModule,MatButtonModule,MatMenuModule,MatIconModule],
  templateUrl: './persona.component.html',
  styleUrl: './persona.component.css'
})
export class PersonaComponent {
  personas: Persona[] = [];
  deletePersonaDialog: boolean = false;
  visible: boolean = false;
  selectedPersonas: Persona[] = [];
  @ViewChild('dt') dt: any;
  menuItems: MenuItem[] = [];
  items: MenuItem[] = [];
  deletePersonasDialog: boolean = false;
  isDeleteInProgress: boolean = false;
  persona: Persona = new Persona();
  titulo: string = '';
  opc: string = '';
  op = 0;

  constructor(
    private personaService: PersonaService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}


  
  ngOnInit() {
    this.listarPersonas();
    this.menuItems = [
        {
          label: 'Importar',
          icon: 'pi pi-file-import',
          command: () => this.importFile()
      },
      {
          label: 'Exportar',
          icon: 'pi pi-upload',
          command: () => this.exportData()
      }]
        ;
        
    }
        
  listarPersonas() {
    this.personaService.getPersonas().subscribe(
      (data) => {
        this.personas = data;
        console.log(this.personas);
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al cargar personas',
          detail: error.message || 'Error al cargar las personas',
        });
      }
    );
  }

  showDialogCreate() {
    this.titulo = "Crear Persona";
    this.opc = "Guardar";
    this.op = 0;
    this.persona = new Persona();  
    this.visible = true;
  }



  showDialogEdit(id: number) {
    this.titulo = "Editar Persona";
    this.opc = "Editar";
    this.personaService.getPersonaById(id).subscribe(
      (data) => {
        this.persona = { ...data };
        this.op = 1;
        this.visible = true;
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al cargar la persona',
          detail: error.message || 'No se pudo cargar la persona',
        });
      }
    );
  }

  showDialogDelete(persona: Persona): void {
    this.persona = { ...persona }; 
    this.deletePersonaDialog = true; 
  }

  deleteSelectedPersonas(): void {
      this.deletePersonasDialog = true;
  }
  
  confirmDeleteSelected(): void {
    const idsToDelete = this.selectedPersonas.map((persona) => persona.id);
  
    this.personaService.deletePersonasBatch(idsToDelete).subscribe({
      next: (response) => {
        console.log('Respuesta del backend:', response); 
        this.messageService.add({
          severity: 'success',
          summary: 'Correcto',
          detail: response.message || 'Personas eliminadas exitosamente.',
        });
        this.listarPersonas(); 
        this.selectedPersonas = []; 
        this.deletePersonasDialog = false; 
      },
      error: (error) => {
        console.error('Error al eliminar personas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.details || 'No se pudieron eliminar las personas. Revisa los detalles del error.',
        });
      },
    });
  }
  
  
  deletePersona(id: number) {
    this.isDeleteInProgress = true;
    this.personaService.deletePersona(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Correcto',
          detail: 'Persona eliminada',
        });
        this.isDeleteInProgress = false;
        this.listarPersonas();
      },
      error: (error) => {
        this.isDeleteInProgress = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar la persona: ' + error.message,
        });
      },
    });
  }

  opcion() {
    if (this.op === 0) {
      this.addPersona();
    } else if (this.op === 1) {
      this.editPersona();
    }
  }

  addPersona() {
    this.personaService.createPersona(this.persona).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Correcto',
          detail: 'Persona Registrada',
        });
        this.listarPersonas();
        this.visible = false;  // Cerrar el diálogo
        this.persona = new Persona();  // Limpiar el formulario
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo agregar la persona: ' + error.message,
        });
      },
    });
  }

  editPersona() {
    this.personaService.updatePersona(this.persona, this.persona.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Correcto',
          detail: 'Persona Editada Correctamente',
        });
        this.listarPersonas();
        this.visible = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo editar la persona: ' + error.message,
        });
      },
    });
  }

  limpiar() {
    this.titulo = '';
    this.opc = '';
    this.op = 0;
    this.persona = new Persona();  // Reinicia la variable persona
    this.visible = false;
  }
  confirmDelete(persona: Persona): void {
    if (!persona || !persona.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo encontrar la persona para eliminar.',
      });
      return;
    }
  
    this.personaService.deletePersona(persona.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Correcto',
          detail: `Persona ${persona.nombre} eliminada exitosamente.`,
        });
        this.listarPersonas(); // Refresca la tabla después de eliminar
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudo eliminar la persona: ${error.message}`,
        });
      },
    });
  
    this.deletePersonaDialog = false; // Cierra el cuadro de diálogo
  }

  deleteSelectedPersona() {
   this.deletePersonaDialog = true;
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

