import * as XLSX from 'xlsx';

/**
 * Mapeamento de nomes alternativos de colunas para os campos padrão.
 * Permite que planilhas com diferentes nomenclaturas sejam interpretadas.
 */
const FIELD_MAP = {
  DataInicio: [
    'DataInicio', 'Data Inicio', 'Data Início', 'DataInicioContrato',
    'Dt Inicio', 'Dt. Início', 'Inicio', 'Início',
  ],
  DataFim: [
    'DataFim', 'Data Fim', 'Data Término', 'DataFimContrato',
    'Dt Fim', 'Dt. Fim', 'Termino', 'Término', 'DataTermino',
  ],
  DataRescisao: [
    'DataRescisao', 'DataRescisão', 'Data Rescisão', 'Data Rescisao',
    'Rescisão', 'Rescisao', 'Dt Rescisão', 'Dt. Rescisão',
  ],
  DataInclusao: [
    'DataInclusao', 'DataInclusão', 'Data Inclusão', 'Data Inclusao',
    'Dt Inclusão', 'Dt. Inclusão',
  ],
  ValorAluguel: [
    'Valor', 'ValorAluguel', 'Valor Aluguel', 'Aluguel', 'ValorLocacao',
    'Valor Locação', 'Valor Locacao', 'VGL', 'Valor Mensal',
  ],
  ValorGarantia: [
    'ValorGarantia', 'Valor Garantia', 'Garantia', 'ValorCaucao',
    'Valor Caução', 'Valor Caucao',
  ],
  SeguroIncendioValor: [
    'SeguroIncendioValor', 'Seguro Incendio', 'Seguro Incêndio',
    'ValorSeguroIncendio', 'Seguro', 'ValorSeguro',
  ],
  FormaGarantia: [
    'FormaGarantia', 'Forma Garantia', 'FormaDeGarantia', 'Forma de Garantia',
  ],
  TipoGarantia: [
    'TipoGarantia', 'Tipo Garantia', 'TipoDeGarantia', 'Tipo de Garantia',
    'Modalidade Garantia', 'Modalidade',
  ],
};

/**
 * Normaliza uma linha de dados, mapeando nomes alternativos de colunas
 * para os nomes padrão esperados pelo sistema.
 */
function normalizeRow(row) {
  const normalized = { ...row };

  Object.entries(FIELD_MAP).forEach(([targetField, aliases]) => {
    if (normalized[targetField] != null) return;

    for (const alias of aliases) {
      if (alias in row && row[alias] != null) {
        normalized[targetField] = row[alias];
        break;
      }
    }
  });

  return normalized;
}

/**
 * Lê um arquivo Excel (.xls / .xlsx) e retorna um array de objetos JSON
 * com as linhas da primeira planilha, com colunas normalizadas.
 *
 * @param {File} file - Arquivo selecionado pelo usuário
 * @returns {Promise<Object[]>} Array de objetos representando cada contrato
 */
export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const json = XLSX.utils.sheet_to_json(worksheet, {
          defval: null,
          raw: true,       // números chegam como number, datas como Date (cellDates:true)
          dateNF: 'YYYY-MM-DD',
        });

        const normalized = json.map(normalizeRow);
        resolve(normalized);
      } catch (err) {
        reject(new Error(`Falha ao processar planilha: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'));
    reader.readAsArrayBuffer(file);
  });
}
