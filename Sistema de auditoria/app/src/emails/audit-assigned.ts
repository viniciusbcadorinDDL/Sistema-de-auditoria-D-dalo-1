/** Template (HTML) do e-mail de alocação de auditoria ao auditor líder. */
export function auditAssignedEmail(params: {
  leaderName: string;
  numero: string;
  cliente: string;
  norma: string;
  dataInicio: string;
  dataFim: string;
  appUrl: string;
}): { subject: string; html: string } {
  const subject = `Nova auditoria atribuída: ${params.numero} — ${params.cliente}`;
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1A2235">
    <div style="background:#1F3A5F;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
      <h1 style="margin:0;font-size:20px;letter-spacing:1px">DÉDALO</h1>
      <span style="font-size:11px;opacity:.7;text-transform:uppercase">Gestão de Auditorias</span>
    </div>
    <div style="border:1px solid #E1E5EC;border-top:0;padding:24px;border-radius:0 0 8px 8px">
      <p>Olá, <strong>${params.leaderName}</strong>.</p>
      <p>Você foi atribuído(a) como auditor líder da seguinte auditoria:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:6px 0;color:#6B7588">Número</td><td style="padding:6px 0;font-weight:600">${params.numero}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7588">Cliente</td><td style="padding:6px 0;font-weight:600">${params.cliente}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7588">Norma</td><td style="padding:6px 0;font-weight:600">${params.norma}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7588">Período</td><td style="padding:6px 0;font-weight:600">${params.dataInicio} a ${params.dataFim}</td></tr>
      </table>
      <a href="${params.appUrl}/minhas-auditorias" style="display:inline-block;background:#1F3A5F;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:14px">Ver minhas auditorias</a>
      <p style="color:#6B7588;font-size:12px;margin-top:20px">Lembre-se de enviar o plano de auditoria com antecedência.</p>
    </div>
  </div>`;
  return { subject, html };
}
