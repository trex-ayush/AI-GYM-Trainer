import jsPDF from "jspdf";
import html2canvas from "html2canvas";


const COLORS = {
  primary: "#1e40af", 
  secondary: "#059669", 
  accent: "#dc2626", 
  dark: "#111827", 
  text: "#1f2937", 
  textLight: "#6b7280", 
  background: "#f3f4f6", 
  white: "#ffffff",
  divider: "#d1d5db", 
  lightBg: "#eff6ff", 
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};


const parseNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value.replace(/[^0-9.]/g, ""));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const drawHeader = (pdf) => {
  const pageWidth = pdf.internal.pageSize.width;
  const primaryRgb = hexToRgb(COLORS.primary);
  pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  pdf.rect(0, 0, pageWidth, 4, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  const darkRgb = hexToRgb(COLORS.dark);
  pdf.setTextColor(darkRgb.r, darkRgb.g, darkRgb.b);
  pdf.text("AI FITNESS COACH", 20, 20);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const textLightRgb = hexToRgb(COLORS.textLight);
  pdf.setTextColor(textLightRgb.r, textLightRgb.g, textLightRgb.b);
  pdf.text("Your Personalized Fitness Plan", 20, 28);

  const dateText = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  pdf.setFontSize(9);
  pdf.text(`Generated: ${dateText}`, pageWidth - 20, 20, { align: "right" });

  const dividerRgb = hexToRgb(COLORS.divider);
  pdf.setDrawColor(dividerRgb.r, dividerRgb.g, dividerRgb.b);
  pdf.setLineWidth(0.5);
  pdf.line(20, 35, pageWidth - 20, 35);
};

const drawDivider = (pdf, yPosition) => {
  const dividerRgb = hexToRgb(COLORS.divider);
  pdf.setDrawColor(dividerRgb.r, dividerRgb.g, dividerRgb.b);
  pdf.setLineWidth(0.3);
  pdf.line(20, yPosition, 190, yPosition);
};

const drawInfoBox = (pdf, text, yPosition, type = "info") => {
  const boxColors = {
    info: COLORS.primary,
    success: COLORS.secondary,
    warning: COLORS.accent,
  };

  const color = hexToRgb(boxColors[type] || COLORS.primary);

  pdf.setFillColor(color.r, color.g, color.b);
  pdf.setGState(new pdf.GState({ opacity: 0.1 }));
  pdf.roundedRect(20, yPosition - 5, 170, 9, 1.5, 1.5, "F");
  pdf.setGState(new pdf.GState({ opacity: 1 }));

  pdf.setFillColor(color.r, color.g, color.b);
  pdf.rect(20, yPosition - 5, 2.5, 9, "F");

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  const textRgb = hexToRgb(COLORS.text);
  pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
  pdf.text(text, 27, yPosition + 1);
};

export const exportToPDF = async (content, filename = "fitness-plan") => {
  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;

    drawHeader(pdf);

    let yPosition = 50;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    const checkPageBreak = (requiredSpace = 20) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        drawHeader(pdf);
        yPosition = 50;
      }
    };

    const textRgb = hexToRgb(COLORS.text);
    const textLightRgb = hexToRgb(COLORS.textLight);
    const primaryRgb = hexToRgb(COLORS.primary);
    const secondaryRgb = hexToRgb(COLORS.secondary);
    const darkRgb = hexToRgb(COLORS.dark);

    if (typeof content === "string") {
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        checkPageBreak();

        const isHeader =
          line.startsWith("#") ||
          (line === line.toUpperCase() &&
            line.length > 0 &&
            line.trim().length > 0);

        if (isHeader) {
          yPosition += 5;
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(14);
          pdf.setTextColor(darkRgb.r, darkRgb.g, darkRgb.b);
          const cleanLine = line.replace(/^#+\s*/, "");
          pdf.text(cleanLine, margin, yPosition);
          yPosition += 8;
          drawDivider(pdf, yPosition);
          yPosition += 8;
        } else {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);

          const splitLines = pdf.splitTextToSize(line || " ", contentWidth);
          splitLines.forEach((splitLine) => {
            checkPageBreak();
            pdf.text(splitLine, margin, yPosition);
            yPosition += 6;
          });
        }
      });
    } else if (typeof content === "object") {
      if (content.meals) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(18);
        pdf.setTextColor(darkRgb.r, darkRgb.g, darkRgb.b);
        pdf.text("NUTRITION PLAN", margin, yPosition);
        yPosition += 3;

        pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        pdf.setLineWidth(1);
        pdf.line(margin, yPosition, margin + 50, yPosition);
        yPosition += 12;

        const totalCalories = content.meals.reduce((sum, meal) => {
          const mealCalories =
            meal.items?.reduce((s, item) => {
              const calories = parseNumber(item.calories);
              return s + calories;
            }, 0) || 0;
          return sum + mealCalories;
        }, 0);

        if (totalCalories > 0) {
          checkPageBreak(15);
          drawInfoBox(
            pdf,
            `Total Daily Calories: ${Math.round(totalCalories)} kcal`,
            yPosition,
            "success"
          );
          yPosition += 18;
        }

        content.meals.forEach((meal, index) => {
          checkPageBreak(40);

          const mealCalories =
            meal.items?.reduce((sum, item) => {
              return sum + parseNumber(item.calories);
            }, 0) || 0;

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(13);
          pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
          pdf.text(`${meal.type || `Meal ${index + 1}`}`, margin, yPosition);
          if (mealCalories > 0) {
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(10);
            pdf.setTextColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
            pdf.text(
              `${Math.round(mealCalories)} kcal`,
              pageWidth - margin,
              yPosition,
              { align: "right" }
            );
          }

          if (meal.time) {
            yPosition += 5.5;
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);
            pdf.setTextColor(textLightRgb.r, textLightRgb.g, textLightRgb.b);
            pdf.text(meal.time, margin, yPosition);
            yPosition += 2.5;
          }

          yPosition += 8;

          meal.items?.forEach((item) => {
            checkPageBreak();

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);

            pdf.circle(margin + 2, yPosition - 1.5, 0.8, "F");
            pdf.text(item.name, margin + 6, yPosition);

            if (item.calories) {
              const calories = parseNumber(item.calories);
              if (calories > 0) {
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(9);
                pdf.setTextColor(
                  textLightRgb.r,
                  textLightRgb.g,
                  textLightRgb.b
                );
                pdf.text(
                  `${Math.round(calories)} cal`,
                  pageWidth - margin,
                  yPosition,
                  { align: "right" }
                );
              }
            }

            yPosition += 5.5;

            if (item.portion) {
              pdf.setFont("helvetica", "italic");
              pdf.setFontSize(8.5);
              pdf.setTextColor(textLightRgb.r, textLightRgb.g, textLightRgb.b);
              pdf.text(item.portion, margin + 6, yPosition);
              yPosition += 5.5;
            }
          });

          yPosition += 8;

          if (index < content.meals.length - 1) {
            const lightDivider = hexToRgb(COLORS.divider);
            pdf.setDrawColor(lightDivider.r, lightDivider.g, lightDivider.b);
            pdf.setLineWidth(0.2);
            pdf.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 8;
          }
        });
      } else if (content.days) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(18);
        pdf.setTextColor(darkRgb.r, darkRgb.g, darkRgb.b);
        pdf.text("WORKOUT PLAN", margin, yPosition);
        yPosition += 3;

        pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        pdf.setLineWidth(1);
        pdf.line(margin, yPosition, margin + 50, yPosition);
        yPosition += 15;

        content.days.forEach((day, index) => {
          checkPageBreak(40);

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(13);
          pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
          pdf.text(`${day.name || `Day ${index + 1}`}`, margin, yPosition);

          if (day.focus) {
            pdf.setFont("helvetica", "italic");
            pdf.setFontSize(9);
            pdf.setTextColor(textLightRgb.r, textLightRgb.g, textLightRgb.b);
            pdf.text(day.focus, pageWidth - margin, yPosition, {
              align: "right",
            });
          }

          yPosition += 8;

          day.exercises?.forEach((exercise, exIndex) => {
            checkPageBreak();

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(10);
            pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
            pdf.text(`${exIndex + 1}.`, margin, yPosition);
            pdf.text(exercise.name, margin + 6, yPosition);
            yPosition += 5.5;

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);
            pdf.setTextColor(textLightRgb.r, textLightRgb.g, textLightRgb.b);

            const details = [];
            if (exercise.sets) details.push(`${exercise.sets} sets`);
            if (exercise.reps) details.push(`${exercise.reps} reps`);
            if (exercise.duration) details.push(exercise.duration);
            if (exercise.rest) details.push(`${exercise.rest} rest`);

            if (details.length > 0) {
              pdf.text(details.join(" | "), margin + 6, yPosition);
              yPosition += 5;
            }

            if (exercise.notes) {
              pdf.setFont("helvetica", "italic");
              pdf.setFontSize(8);
              const noteLines = pdf.splitTextToSize(
                `Note: ${exercise.notes}`,
                contentWidth - 10
              );
              noteLines.forEach((line) => {
                checkPageBreak();
                pdf.text(line, margin + 6, yPosition);
                yPosition += 4.5;
              });
            }

            yPosition += 4;
          });

          yPosition += 8;

          if (index < content.days.length - 1) {
            const lightDivider = hexToRgb(COLORS.divider);
            pdf.setDrawColor(lightDivider.r, lightDivider.g, lightDivider.b);
            pdf.setLineWidth(0.2);
            pdf.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 8;
          }
        });
      }
    }

    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);

      const dividerRgb = hexToRgb(COLORS.divider);
      pdf.setDrawColor(dividerRgb.r, dividerRgb.g, dividerRgb.b);
      pdf.setLineWidth(0.3);
      pdf.line(20, pageHeight - 18, pageWidth - 20, pageHeight - 18);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(textLightRgb.r, textLightRgb.g, textLightRgb.b);
      pdf.text("AI Fitness Coach", 20, pageHeight - 12);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 12, {
        align: "center",
      });
      pdf.text(
        new Date().getFullYear().toString(),
        pageWidth - 20,
        pageHeight - 12,
        { align: "right" }
      );
    }

    pdf.save(`${filename}-${Date.now()}.pdf`);

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

export const exportElementToPDF = async (
  elementId,
  filename = "fitness-plan"
) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    const originalStyle = element.style.cssText;
    element.style.cssText += `
      background: white;
      padding: 20px;
      font-family: Arial, sans-serif;
    `;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    element.style.cssText = originalStyle;

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}-${Date.now()}.pdf`);

    return true;
  } catch (error) {
    console.error("Error generating PDF from element:", error);
    throw error;
  }
};
