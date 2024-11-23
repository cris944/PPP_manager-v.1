import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Empresa } from '../models/empresa';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  private apiUrl = 'http://localhost:8080/api/empresas';

  constructor(private http: HttpClient) { }


   getEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.apiUrl);
  }


  getEmpresasById(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/${id}`);
  }

  createEmpresa(empresas: Empresa): Observable<Empresa> {
    return this.http.post<Empresa>(this.apiUrl, empresas);
  }


  updateEmpresa(empresa: Empresa, id: number): Observable<Empresa> {
    return this.http.put<Empresa>(`${this.apiUrl}/${id}`, empresa);
  }


  deleteEmpresa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteEmpresasBatch(ids: number[]): Observable<any> {
    return this.http.request('DELETE', `${this.apiUrl}/batch`, {
      body: ids,
    });
}}