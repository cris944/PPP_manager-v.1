import { Component, ElementRef, ViewChild,HostListener } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
})
export class AppTopBarComponent {
    menuItems: MenuItem[] = []; // Opciones del menú
    isEditingProfile: boolean = false; // Controla si se está editando el perfil
    isProfileMenuOpen: boolean = false;
    profileImage: string = 'https://vaiu.es/wp-content/uploads/2016/11/Bamse.gif'; // Reemplazar con la URL real
    userName: string = 'Cristhian Gabriel';
    userEmail: string = 'cristhian.aquino@gmail.com';
    

    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
    @ViewChild('topbarmenu') menu!: ElementRef;
    @ViewChild('menu') menuuser!: ElementRef;

    constructor(public layoutService: LayoutService,private eRef: ElementRef) {
        this.menuItems = [
            { label: 'Ver Perfil', icon: 'pi pi-user', command: () => this.goToProfile() },
            { label: 'Cerrar Sesión', icon: 'pi pi-power-off', command: () => this.logout() },
        ];
    }

    goToProfile() {
        this.isEditingProfile = true; // Activa el modo de edición
        console.log('Editar perfil activado');
    }

    // Método para cerrar sesión
    logout() {
        console.log('Cerrar sesión');
    }

    toggleProfileMenu() {
        this.isProfileMenuOpen = !this.isProfileMenuOpen;
      }
    
      editProfile() {
        console.log('Editar Perfil');
        // Agregar lógica para redirigir o abrir modal de edición de perfil
      }
      @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        // Cierra el menú si el clic ocurre fuera del botón o del menú
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.isProfileMenuOpen = false;
        }
    }
    closeProfileMenu() {
        this.isProfileMenuOpen = false;
    }
    
}
