import { Component, ViewChild } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Estudiante } from '../models/estudiante';
import { Persona } from '../models/persona';
import { EstudianteService } from '../services/estudiante.service';
import { PersonaService } from '../services/persona.service';
import { ToolbarModule } from 'primeng/toolbar';
import { FileUploadModule } from 'primeng/fileupload';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ExcelService } from '../services/excel.service';

@Component({
  selector: 'app-estudiante',
  standalone: true,
  imports: [
    ButtonModule,ToastModule,ToolbarModule,FileUploadModule,TableModule, ButtonModule, DialogModule, RouterModule, InputTextModule,
    FormsModule, ConfirmDialogModule,SplitButtonModule,MatButtonModule,MatMenuModule,MatIconModule
  ],
  templateUrl: './estudiante.component.html',
  styleUrls: ['./estudiante.component.css'],
})
export class EstudianteComponent {
  estudiantes: Estudiante[] = [];
  personas: Persona[] = [];
  deleteEstudianteDialog: boolean = false;
  visible: boolean = false;
  selectedEstudiantes: Estudiante[] = [];
  deletePersonasDialog: boolean = false;
  @ViewChild('dt') dt: any;
  @ViewChild('fileInput') fileInput!: any;
  menuItems: MenuItem[] = [];
  items: MenuItem[] = [];
  estudiante: Estudiante = new Estudiante();
  persona: Persona = new Persona();
  titulo: string = '';
  opc: string = '';
  op = 0;

  constructor(
    private estudianteService: EstudianteService,
    private excelService: ExcelService,
    private personaService: PersonaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.listarEstudiantes();
    this.menuItems = [
      {
        label: 'Importar',
        icon: 'pi pi-file-import',
        command: () => this.showFileUploadDialog(),
      },
      {
        label: 'Exportar',
        icon: 'pi pi-upload',
        command: () => this.exportData(),
      },
    ];
  }
////////////////////////////////////////////////////////////////
//**IMPORTAR**//
///////////////
triggerFileInput(): void {
  this.fileInput.nativeElement.click();
}

showFileUploadDialog() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.xlsx';
  fileInput.addEventListener('change', (event: any) => {
      const file = event.target.files[0];
      if (file) {
          console.log('Archivo seleccionado:', file);
          this.importFile(file);
      } else {
          console.error('No se seleccionó ningún archivo.');
      }
  });
  fileInput.click();

  fileInput.addEventListener('click', () => {
    document.body.removeChild(fileInput);
  });
}

importFile(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) {
      this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se seleccionó ningún archivo.',
      });
      return;
  }

  const file = input.files[0];
  console.log('Archivo seleccionado:', file);

  const formData = new FormData();
  formData.append('file', file);

this.estudianteService.importExcel(formData).subscribe({
    next: (response: any) => {
        console.log('Respuesta del servidor:', response);
        const message = response?.message || 'Los datos se importaron correctamente.';
        this.messageService.add({
            severity: 'success',
            summary: 'Importación exitosa',
            detail: message,
        });
        this.listarEstudiantes(); // Refresca la tabla
    },
    error: (error) => {
        this.messageService.add({
            severity: 'error',
            summary: 'Error de Importación',
            detail: error.error?.message || 'No se pudieron importar los datos. Verifica el archivo.',
        });
    },
});

}
///////////////////////////////////////////////////////////////

  listarEstudiantes() {
    this.estudianteService.getEstudiantes().subscribe(
      (data) => {
        this.estudiantes = data;
        console.log(this.estudiantes);
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al cargar estudiantes',
          detail: error.message || 'Error al cargar los estudiantes',
        });
      }
    );
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
    this.prepareDialog('Crear Estudiante', 'Guardar', 0);
  }

  showDialogEdit(id: number) {
    this.titulo = 'Editar Estudiante';
    this.opc = 'Actualizar';
    
    

    // Llamada al servicio para obtener los datos del estudiante por ID
    this.estudianteService.getEstudianteById(id).subscribe({
      next: (data) => {
        // Aseguramos que tanto el estudiante como la persona sean asignados correctamente
        this.estudiante = { ...data };
        this.persona = { ...this.estudiante.persona };  // Opcional, si necesitas trabajar con persona aparte

        // Llamamos al método para preparar el diálogo (en este caso se puede usar directamente)
        this.visible = true;  // Mostrar el diálogo
      },
      error: (error) => this.handleError(error, 'Error al cargar el estudiante'),
    });
  }

  deleteSelectedPersonas(): void {
    this.deletePersonasDialog = true;
}

  prepareDialog(title: string, buttonText: string, opValue: number) {
    this.titulo = title;
    this.opc = buttonText;
    this.op = opValue;
    this.estudiante = new Estudiante();
    this.persona = new Persona();
    this.visible = true;
  }

  opcion() {
    if (this.op === 0) {
      this.addPersonaAndEstudiante();
    } else if (this.op === 1) {
      this.updatePersonaAndEstudiante();
    }
  }

  showDialogDelete(id: number): void {
    this.estudianteService.getEstudianteById(id).subscribe({
      next: (data) => {        this.estudiante = { ...data };
        this.persona = { ...this.estudiante.persona };
        this.deleteEstudianteDialog = true;
      },
      error: (error) => this.handleError(error, 'Error al cargar el estudiante'),
    });

  }

  deleteSelectedEstudiantes(): void {
    this.deletePersonasDialog = true;
  }

  confirmDeleteSelected(): void {
    const idsToDelete = this.selectedEstudiantes.map(
      (estudiante) => estudiante.id
    );

    this.estudianteService.deleteEstudiantesBatch(idsToDelete).subscribe({
      next: (response) => {
        console.log('Respuesta del backend:', response);
        this.messageService.add({
          severity: 'success',
          summary: 'Correcto',
          detail: response.message || 'Estudiantes eliminados exitosamente.',
        });
        this.listarEstudiantes();
        this.selectedEstudiantes = [];
        this.deleteEstudianteDialog = false;
      },
      error: (error) => {
        console.error('Error al eliminar estudiantes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail:
            error.error?.details ||
            'No se pudieron eliminar los estudiantes. Revisa los detalles del error.',
        });
      },
    });
  }

  deleteEstudiante(id: number) {
    this.estudianteService.deleteEstudiante(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Correcto',
          detail: 'Estudiante Eliminado',
        });
        this.listarEstudiantes();
      },
      error: (error) =>
        this.handleError(error, 'No se pudo eliminar el estudiante'),
    });
  }


  addPersonaAndEstudiante() {
    if (this.isValid()) {
      console.log('Datos de Persona:', this.persona); // Verifica los datos antes de enviarlos
      this.personaService.createPersona(this.persona).subscribe({
        next: (persona) => {
          console.log('Respuesta de la API:', persona); // Verifica la respuesta
          this.estudiante.persona = persona;
          this.createEstudiante();
        },
        error: (error) => this.handleError(error, 'No se pudo agregar la persona')
      });
    }
  }
  updatePersonaAndEstudiante() {
    if (this.isValid()) {
      this.personaService.updatePersona(this.persona, this.persona.id).subscribe({
        next: (updatedPersona) => {
          this.estudiante.persona = updatedPersona;
          this.updateEstudiante();
        },
        error: (error) =>
          this.handleError(error, 'No se pudo actualizar la persona'),
      });
    }
  }
  createEstudiante() {
    this.estudianteService.createEstudiante(this.estudiante).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Correcto',
          detail: 'Estudiante Registrado',
        });
        this.listarEstudiantes();
        this.closeDialog();
      },
      error: (error) =>
        this.handleError(error, 'No se pudo agregar el estudiante'),
    });
  }
  updateEstudiante() {
    this.estudianteService.updateEstudiante(this.estudiante).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Correcto',
          detail: 'Estudiante Actualizado',
        });
        this.listarEstudiantes();
        this.closeDialog();
      },
      error: (error) =>
        this.handleError(error, 'No se pudo actualizar el estudiante'),
    });
  }

  limpiar() {
    this.titulo = '';
    this.opc = '';
    this.op = 0;
    this.estudiante = new Estudiante();
    this.visible = false;
  }

  isValid(): boolean {
    if (
      !this.persona.nombre ||
      !this.persona.apellido ||
      !this.persona.dni ||
      !this.persona.correo ||
      !this.persona.telefono ||
      !this.persona.estado ||
      !this.estudiante.codigo
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son obligatorios',
      });
      return false;
    }
    return true;
  }

  confirmDelete(estudiante: Estudiante): void {
    if (!estudiante || !estudiante.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo encontrar el estudiante para eliminar.',
      });
      return;
    }

    this.estudianteService.deleteEstudiante(estudiante.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Correcto',
          detail: `Estudiante ${estudiante.persona?.nombre} eliminado exitosamente.`,
        });
        this.listarEstudiantes();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudo eliminar el estudiante: ${error.message}`,
        });
      },
    });

    this.deleteEstudianteDialog = false;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onSelectionChange(): void {
    this.cdr.detectChanges();
  }

  exportData() {
    if (this.dt) {
      this.dt.exportCSV();
    } else {
      console.error('La referencia a la tabla no está definida.');
    }
  }
  handleError(error: any, defaultMessage: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || defaultMessage,
    });
  }
  closeDialog() {
    this.visible = false;
    this.estudiante = new Estudiante();
    this.persona = new Persona();
  }
}
