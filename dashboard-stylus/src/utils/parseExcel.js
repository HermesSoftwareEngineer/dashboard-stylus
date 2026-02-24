import * as XLSX from 'xlsx';

/**
 * Mapeamento de nomes alternativos de colunas para os campos padrão.
 * Permite que planilhas com diferentes nomenclaturas sejam interpretadas.
 */
const FIELD_MAP = {
  DataCadastro: [
    'DataCadastro', 'Data Cadastro', 'Data Cadastro Imovel', 'Data Cadastro Imóvel',
    'DataCadastroImovel', 'DataCadastroImóvel',
  ],
  DataAtualizacao: [
    'DataAtualizacao', 'Data Atualizacao', 'Data Atualização',
    'DataAtualizacaoImovel', 'Data Atualizacao Imovel', 'Data Atualização Imóvel',
  ],
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
  Destinacao: [
    'Destinacao', 'Destinação', 'Destinacao Imovel', 'Destinação Imóvel',
  ],
  Finalidade: [
    'Finalidade', 'Finalidade Imovel', 'Finalidade Imóvel',
  ],
  Pontuacao: [
    'Pontuacao', 'Pontuação', 'Pontuacao Cadastro', 'Pontuação Cadastro',
    'Score', 'Pontuação do Cadastro',
  ],
  ValorAluguel: [
    'Valor', 'ValorAluguel', 'Valor Aluguel', 'Aluguel', 'ValorLocacao',
    'Valor Locação', 'Valor Locacao', 'VGL', 'Valor Mensal',
  ],
  Valor: [
    'Valor', 'Valor Venda', 'ValorVenda', 'Valor Imovel', 'Valor Imóvel',
    'Valor do Imovel', 'Valor do Imóvel', 'Valor de Venda', 'Valor Venda Imovel',
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

  const lookup = Object.entries(row).reduce((acc, [key, value]) => {
    const trimmed = String(key).trim();
    if (!(trimmed in acc)) acc[trimmed] = value;
    const lower = trimmed.toLowerCase();
    if (!(lower in acc)) acc[lower] = value;
    return acc;
  }, {});

  Object.entries(FIELD_MAP).forEach(([targetField, aliases]) => {
    if (normalized[targetField] != null) return;

    for (const alias of aliases) {
      const trimmedAlias = alias.trim();
      if (trimmedAlias in row && row[trimmedAlias] != null) {
        normalized[targetField] = row[trimmedAlias];
        break;
      }

      const lowerAlias = trimmedAlias.toLowerCase();
      if (lowerAlias in lookup && lookup[lowerAlias] != null) {
        normalized[targetField] = lookup[lowerAlias];
        break;
      }
    }
  });

  return normalized;
}

/**
 * Tenta interpretar um arquivo .xls gerado como HTML (tabela).
 * Retorna null caso não identifique tabela HTML válida.
 */
function parseHtmlTable(htmlText) {
  const normalizedText = htmlText.trim().toLowerCase();
  if (!normalizedText.includes('<table')) return null;

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');
  const table = doc.querySelector('table');
  if (!table) return null;

  const firstRow = table.querySelector('tr');
  if (!firstRow) return null;

  const headerCells = Array.from(firstRow.querySelectorAll('th'));
  const headerSource = headerCells.length > 0
    ? headerCells
    : Array.from(firstRow.querySelectorAll('td'));

  if (headerSource.length === 0) return null;

  const headers = headerSource.map((cell) => cell.textContent.trim());
  const rows = [];

  Array.from(table.querySelectorAll('tr')).slice(1).forEach((tr) => {
    const cells = Array.from(tr.querySelectorAll('td')).map((td) => {
      const cleaned = td.textContent.replace(/\u00a0/g, ' ').trim();
      return cleaned === '' ? null : cleaned;
    });

    if (cells.length === 0) return;

    const row = {};
    headers.forEach((header, idx) => {
      row[header] = cells[idx] ?? null;
    });
    rows.push(row);
  });

  return rows;
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
        const textPreview = new TextDecoder('utf-8').decode(data);
        const htmlRows = parseHtmlTable(textPreview);

        if (htmlRows) {
          const normalized = htmlRows.map(normalizeRow);
          resolve(normalized);
          return;
        }

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
