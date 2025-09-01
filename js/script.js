(function () {
  const form = document.getElementById('formVinculo');
  const steps = form.querySelectorAll('.step');
  const progress = document.getElementById('progress');
  const resultado = document.getElementById('resultado');
  const veredito = document.getElementById('veredito');
  const explicacao = document.getElementById('explicacao');
  const btnPDF = document.getElementById('btnPDF');

  let currentStep = 0;

  // Mostrar etapa correta
  function showStep(index) {
    steps.forEach((s, i) => s.classList.toggle('active', i === index));
    progress.style.width = ((index + 1) / steps.length) * 100 + '%';
  }

  // Validar apenas o step atual
  function validateStep(stepIndex) {
    const radios = steps[stepIndex].querySelectorAll('input[type="radio"]');
    return Array.from(radios).some(r => r.checked);
  }

  // Navegação entre etapas
  form.addEventListener('click', (e) => {
    if (e.target.classList.contains('next')) {
      if (!validateStep(currentStep)) {
        alert('Por favor, responda antes de avançar.');
        return;
      }
      if (currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
      }
    }

    if (e.target.classList.contains('prev')) {
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    }
  });

  // Pegar valor de resposta
  function getValue(name) {
    const el = form.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : null;
  }

  // Tag de status (ok / err)
  function tag(ok) {
    const span = document.createElement('span');
    span.className = `tag ${ok ? 'ok' : 'err'}`;
    span.textContent = ok ? 'Atendido' : 'Não atendido';
    return span;
  }

  // Criar linha explicativa
  function linha(label, ok, detalhe) {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${label}:</strong> ${detalhe || ''} `;
    li.appendChild(tag(ok));
    return li;
  }

  // Resultado final
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const sub = getValue('subordinacao') === 'sim';
    const hab = getValue('habitualidade') === 'sim';
    const pes = getValue('pessoalidade') === 'sim';
    const one = getValue('onerosidade') === 'sim';

    const totalOk = [sub, hab, pes, one].filter(Boolean).length;

    explicacao.innerHTML = '';
    explicacao.appendChild(linha('Subordinação', sub, sub ? 'Há ordens/diretrizes do empregador.' : 'Não há submissão.'));
    explicacao.appendChild(linha('Não eventualidade (habitualidade)', hab, hab ? 'Serviço prestado com regularidade.' : 'Prestação eventual.'));
    explicacao.appendChild(linha('Pessoalidade', pes, pes ? 'Serviço pessoal, sem substituição livre.' : 'Possibilidade de substituição.'));
    explicacao.appendChild(linha('Onerosidade', one, one ? 'Há remuneração.' : 'Não há contraprestação.'));

    const temVinculo = sub && hab && pes && one;

    veredito.textContent = temVinculo
      ? 'Resultado: Há fortes indícios de VÍNCULO EMPREGATÍCIO.'
      : (totalOk >= 2
          ? 'Resultado: Indícios parciais — podem não ser suficientes.'
          : 'Resultado: Pelas respostas, NÃO há vínculo empregatício.');

    veredito.style.color = temVinculo ? 'var(--accent)' : (totalOk >= 2 ? '#eab308' : '#d32f2f');

    resultado.hidden = false;
    resultado.scrollIntoView({ behavior: 'smooth' });
  });

  // Exportar PDF
  btnPDF.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Resultado - Verificação de Vínculo Empregatício", 14, 20);
    doc.setFontSize(12);
    doc.text(veredito.textContent, 14, 35);

    let y = 50;
    explicacao.querySelectorAll('li').forEach(li => {
      doc.text(li.innerText, 14, y);
      y += 10;
    });

    doc.save("resultado-vinculo.pdf");
  });

  // Iniciar na primeira etapa
  showStep(currentStep);
})();
