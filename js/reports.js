// Função para carregar as bibliotecas com timeout
async function loadLibraries() {
    return new Promise((resolve) => {
        const checkLibraries = setInterval(() => {
            if (typeof window.jspdf !== 'undefined' && typeof window.jspdf.autoTable !== 'undefined') {
                clearInterval(checkLibraries);
                console.log('Bibliotecas jsPDF e jsPDF-AutoTable carregadas com sucesso.');
                resolve(true);
            }
        }, 100);

        setTimeout(() => {
            clearInterval(checkLibraries);
            if (typeof window.jspdf === 'undefined' || typeof window.jspdf.autoTable === 'undefined') {
                console.error('Falha no carregamento das bibliotecas após 5 segundos. Verifique a internet.');
                alert('Erro: Bibliotecas jsPDF ou jsPDF-AutoTable não carregaram. Verifique a conexão e recarregue.');
                resolve(false);
            }
        }, 5000);
    });
}

// Função para obter faltas com fallback
async function getAbsences() {
    try {
        const absences = JSON.parse(localStorage.getItem('absences') || '[]');
        console.log('Faltas carregadas do localStorage:', absences.length, 'registros');
        return absences;
    } catch (error) {
        console.error('Erro ao carregar faltas do localStorage, usando fallback vazio:', error);
        return [];
    }
}

// Função para obter horários com fallback
async function getSchedules() {
    try {
        const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
        console.log('Horários carregados do localStorage:', schedules.length, 'registros');
        return schedules;
    } catch (error) {
        console.error('Erro ao carregar horários do localStorage, usando fallback vazio:', error);
        return [];
    }
}

// Função para filtrar dados por período
function filterByPeriod(data, period) {
    const today = new Date();
    return data.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        switch (period) {
            case 'daily':
                return itemDate.toDateString() === today.toDateString();
            case 'weekly':
                const oneWeekAgo = new Date(today);
                oneWeekAgo.setDate(today.getDate() - 7);
                return itemDate >= oneWeekAgo && itemDate <= today;
            case 'monthly':
                const oneMonthAgo = new Date(today);
                oneMonthAgo.setMonth(today.getMonth() - 1);
                return itemDate >= oneMonthAgo && itemDate <= today;
            default:
                return true;
        }
    });
}

// Função para gerar PDF de faltas
async function generateAbsencesPDF(period) {
    console.log(`Iniciando geração de PDF de faltas para período: ${period}`);

    if (!(await loadLibraries())) return;

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const absences = filterByPeriod(await getAbsences(), period);
        console.log(`Faltas filtradas para ${period}:`, absences.length);

        doc.text('Centro de Excelência Miguel das Graças - Relatório de Faltas', 10, 10);

        if (absences.length === 0) {
            doc.text(`Nenhum registro encontrado para o período ${period}.`, 10, 20);
        } else {
            doc.autoTable({
                head: [['Aluno', 'Série', 'Data', 'Motivo']],
                body: absences.map(item => [
                    item.name || 'N/A',
                    item.grade || 'N/A',
                    item.date || 'N/A',
                    item.reason || 'N/A'
                ]),
                startY: 20,
                styles: { fontSize: 8, cellPadding: 3 },
                headStyles: { fillColor: [41, 128, 185] },
                theme: 'grid'
            });
        }

        // Tentativa de salvamento com verificação de navegador
        try {
            doc.save(`relatorio_faltas_${period}.pdf`);
            console.log(`PDF de faltas salvo com sucesso como relatorio_faltas_${period}.pdf`);
            alert('PDF gerado e baixado com sucesso!');
        } catch (saveError) {
            console.error('Erro ao salvar o PDF:', saveError);
            if (saveError.name === 'SecurityError' || saveError.name === 'NotAllowedError') {
                alert('Erro: O navegador bloqueou o download. Verifique as permissões ou desative bloqueadores de pop-up.');
            } else {
                alert('Erro ao baixar o PDF: ' + saveError.message + '. Verifique o console.');
            }
        }
    } catch (error) {
        console.error('Erro geral ao gerar PDF de faltas:', error);
        alert('Erro ao gerar PDF: ' + error.message + '. Verifique o console.');
    }
}

// Função para gerar PDF de horários
async function generateSchedulesPDF(period) {
    console.log(`Iniciando geração de PDF de horários para período: ${period}`);

    if (!(await loadLibraries())) return;

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const schedules = filterByPeriod(await getSchedules(), period);
        console.log(`Horários filtrados para ${period}:`, schedules.length);

        doc.text('Centro de Excelência Miguel das Graças - Relatório de Horários', 10, 10);

        if (schedules.length === 0) {
            doc.text(`Nenhum registro encontrado para o período ${period}.`, 10, 20);
        } else {
            doc.autoTable({
                head: [['Monitor', 'Data', 'Entrada', 'Saída']],
                body: schedules.map(item => [
                    item.monitorName || 'N/A',
                    item.date || 'N/A',
                    item.entry || 'N/A',
                    item.exit || 'N/A'
                ]),
                startY: 20,
                styles: { fontSize: 8, cellPadding: 3 },
                headStyles: { fillColor: [41, 128, 185] },
                theme: 'grid'
            });
        }

        // Tentativa de salvamento com verificação de navegador
        try {
            doc.save(`relatorio_horarios_${period}.pdf`);
            console.log(`PDF de horários salvo com sucesso como relatorio_horarios_${period}.pdf`);
            alert('PDF gerado e baixado com sucesso!');
        } catch (saveError) {
            console.error('Erro ao salvar o PDF:', saveError);
            if (saveError.name === 'SecurityError' || saveError.name === 'NotAllowedError') {
                alert('Erro: O navegador bloqueou o download. Verifique as permissões ou desative bloqueadores de pop-up.');
            } else {
                alert('Erro ao baixar o PDF: ' + saveError.message + '. Verifique o console.');
            }
        }
    } catch (error) {
        console.error('Erro geral ao gerar PDF de horários:', error);
        alert('Erro ao gerar PDF: ' + error.message + '. Verifique o console.');
    }
              }
