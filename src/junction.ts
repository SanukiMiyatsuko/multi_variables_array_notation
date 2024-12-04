import { Zero_Function } from './code/code_a_Zero';
import { Subspecies_Function } from './code/code_b_Subspecies';
import { Old_Subspecies_Function } from './code/code_f_OldSubspecies';
import { Buchholzs_Psi_Function } from './code/code_h_BuchholzsPsi';
import { Two_Claused_Point_Psi_Function } from './code/code_i_TwoClausedPointPsi';
import { Three_Claused_Point_Psi_Function } from './code/code_j_ThreeClausedPointPsi';
import { T } from './intersection';

export interface Hyouki {
    fund(a: T, b: T, code: string): T;
    dom(a: T, code: string): T;
}

export function switchFunc(fnName: string): Hyouki {
    switch (fnName) {
        case "〇":
            return new Zero_Function();
        case "亜":
            return new Subspecies_Function();
        case "亞":
            return new Old_Subspecies_Function();
        case "ψ":
            return new Buchholzs_Psi_Function();
        case "C":
            return new Two_Claused_Point_Psi_Function();
        case "M":
            return new Three_Claused_Point_Psi_Function();
        default:
            throw new Error("不明な操作");
    }
}