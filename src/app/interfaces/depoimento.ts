import { Observable } from 'rxjs';
import { Comment } from './comment';

export interface Depoimento {
    id?: string;
    key?: string;
    depoimento?: string;
    foto?: string;
    likes?: number;
    liked?: boolean;
    location?: string;
    subtitulo?: string;
    nomeUsuario?: string;
    data?: number;
    userId?: string;
    comments?: Comment[];
}

export interface Depoimentos {
    offset: number;
    limit: number;
    total?: number;
    results: Observable<Depoimento>[];
   }
