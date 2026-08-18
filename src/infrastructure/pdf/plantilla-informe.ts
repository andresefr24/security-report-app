// La PLANTILLA del informe: los rótulos y los textos fijos del documento.
//
// Por qué existe (decisions#d9-informe-v2, afinado 3): el PDF calca los informes
// reales de TPF/Getinsa, pero el formato no se escribe a fuego dentro del código
// que construye el documento. Todo lo que es "cómo se llama cada cosa en ESTE
// formato" vive aquí; construir-documento.ts solo sabe de estructura (cabecera,
// secciones, actividades, firmas). Cambiar de organismo = otra plantilla, no otro
// programa.
//
// Los rótulos salen de la lectura de los 8 informes reales: ver
// docs/maqueta-informe-real.md, que es la ficha de la que se copió todo esto.

export interface PlantillaInforme {
  /** El título de la banda superior, una línea por renglón. */
  titulo: string[];
  /** El bloque de la derecha de la banda: código de formato y revisión. */
  formato: string[];
  /**
   * El texto que acompaña al emisor a la derecha del título. Se completa con la
   * empresa del PERFIL del coordinador: en los informes reales firman personas
   * distintas, así que nunca se fija aquí.
   */
  prefijoEmisorCabecera: string;
  /** El valor fijo del campo "Tipo Documento" de la cabecera. */
  tipoDocumento: string;
  /**
   * Aviso de alcance que va justo debajo de la cabecera. Sustituye a la vieja
   * frase de contexto: los coordinadores lo pidieron literal, porque acota su
   * responsabilidad a lo que se vio ese día.
   */
  avisoAlcance: string;
  /** Cómo se llama cada campo de la tabla de cabecera. */
  etiquetas: {
    obra: string;
    promotor: string;
    contratista: string;
    identificacion: string;
    fecha: string;
    ubicacion: string;
    cifContratista: string;
    plazoEjecucion: string;
    presupuestoEjecucion: string;
    presupuestoEss: string;
    fechaInicio: string;
    fechaFin: string;
    tipoDocumento: string;
    emisor: string;
    empresaEmisor: string;
    receptor: string;
    empresaReceptor: string;
  };
  /** Los rótulos de sección, en mayúsculas como en el original. */
  rotulos: {
    calendario: string;
    situacion: string;
    ubicacionActividad: string;
    descripcionActividad: string;
    distribucion: string;
  };
  /** Cuántas fotos caben en una fila. */
  fotosPorFila: number;
  /** Cómo se rotula cada foto en su pie: "Foto 3". */
  etiquetaFoto: string;
  /** Los dos encabezados del recuadro de firmas y el cargo del coordinador. */
  firmas: {
    tituloCoordinador: string;
    tituloRecibido: string;
    cargoCoordinador: string;
    /** Cómo se rotula el nº de registro junto al cargo. */
    etiquetaRegistro: string;
  };
}

/**
 * La plantilla del informe semanal de visitas (formato 02_03 G13a-SSFE), que es
 * el más frecuente de los informes reales: 4 de los 8. El de visita puntual
 * (G13-SSFE) cambia rótulos de cabecera y añade un párrafo legal; cuando haga
 * falta, se añade aquí al lado como otra constante.
 */
export const PLANTILLA_SEMANAL: PlantillaInforme = {
  titulo: ["INFORME DE VISITA DEL COORDINADOR", "DE SEGURIDAD Y SALUD"],
  formato: ["Formato 02_03", "G13a- SSFE", "Revisión: 0"],
  prefijoEmisorCabecera: "ING. CSS ",
  tipoDocumento: "INFORMATIVO",
  avisoAlcance:
    "Las observaciones recogidas en el presente informe se limitan a las condiciones " +
    "y situaciones detectadas durante la visita realizada, por lo que no tienen " +
    "carácter exhaustivo. La ausencia de referencia a otras posibles deficiencias no " +
    "implica su inexistencia ni exime a las empresas intervinientes del cumplimiento " +
    "de la normativa vigente en materia de seguridad y salud, así como de las medidas " +
    "preventivas establecidas en el Plan de Seguridad y Salud y demás documentación " +
    "preventiva aplicable.",
  etiquetas: {
    obra: "Obra:",
    promotor: "Entidad Promotora:",
    contratista: "Contratista:",
    identificacion: "Identificación Documento:",
    fecha: "Fecha:",
    ubicacion: "Ubicación:",
    cifContratista: "CIF:",
    plazoEjecucion: "Plazo de ejecución:",
    presupuestoEjecucion: "Presupuesto de ejecución:",
    presupuestoEss: "Presupuesto ESS:",
    fechaInicio: "Inicio:",
    fechaFin: "Fin:",
    tipoDocumento: "Tipo Documento:",
    emisor: "Emisor:",
    empresaEmisor: "Empresa:",
    receptor: "Receptor:",
    empresaReceptor: "Empresa/Entidad:",
  },
  rotulos: {
    calendario: "CALENDARIO DE VISITAS Y TRABAJOS EN EJECUCIÓN",
    situacion: "SITUACIÓN DE LA OBRA",
    ubicacionActividad: "Ubicación",
    descripcionActividad: "DESCRIPCIÓN DE LA ACTIVIDAD",
    distribucion: "Enviado por e-mail a:",
  },
  // Los informes reales ponen una foto por fila y gastan una hoja por foto. El
  // stakeholder pidió expresamente dos: es una mejora deliberada, no una copia.
  fotosPorFila: 2,
  etiquetaFoto: "Foto",
  firmas: {
    tituloCoordinador: "Informe realizado por:",
    tituloRecibido: "Recibido por:",
    cargoCoordinador: "Coordinador de Seguridad y Salud",
    etiquetaRegistro: "IRSST",
  },
};
