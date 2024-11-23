import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ExcelService {
  private apiUrl = 'http://localhost:8080/api/excel'; // Cambia esta URL si es necesario

  constructor(private http: HttpClient) {}

  /**
   * Método para importar datos desde un archivo Excel
   * @param file Archivo Excel que se enviará al backend
   * @returns Observable con el resultado de la importación
   */
  importData(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    console.log('Enviando archivo al backend:', file); // Verifica que el archivo esté correctamente seleccionado

    return this.http.post<string[]>(`${this.apiUrl}/upload`, formData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Manejo de errores
   * @param error Error capturado durante la petición HTTP
   * @returns Observable con el error procesado
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error del servidor: Código ${error.status}, ${error.message}`;
      console.error('Detalles del error:', error.error); // Agrega detalles adicionales para depuración
    }
    return throwError(errorMessage);
  }
}
