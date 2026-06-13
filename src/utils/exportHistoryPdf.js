import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportElementToPdf = async ({
  elementId,
  fileName = 'historial.pdf',
}) => {
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error('No se encontró el elemento para exportar');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('landscape', 'mm', 'a4');

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth - 16;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let positionY = 8;

  if (imgHeight <= pageHeight - 16) {
    pdf.addImage(imgData, 'PNG', 8, positionY, imgWidth, imgHeight);
  } else {
    let remainingHeight = imgHeight;
    let sourceY = 0;

    while (remainingHeight > 0) {
      pdf.addImage(imgData, 'PNG', 8, positionY - sourceY, imgWidth, imgHeight);

      remainingHeight -= pageHeight;
      sourceY += pageHeight;

      if (remainingHeight > 0) {
        pdf.addPage();
      }
    }
  }

  pdf.save(fileName);
};