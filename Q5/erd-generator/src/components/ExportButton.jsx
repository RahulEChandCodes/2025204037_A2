import React, { useState } from "react";
import { Button, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import html2pdf from "html2pdf.js";

const ExportButton = () => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);

    try {
      const element = document.getElementById("erd-content");

      if (!element) {
        message.error("No content to export");
        return;
      }

      // Configure html2pdf options
      const options = {
        margin: 0.5,
        filename: `ERD_${new Date().toISOString().split("T")[0]}.pdf`,
        image: {
          type: "jpeg",
          quality: 0.98,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: "#ffffff",
        },
        jsPDF: {
          unit: "in",
          format: "a4",
          orientation: "landscape",
        },
      };

      // Show loading message
      message.loading({
        content: "Generating PDF...",
        key: "pdf-export",
        duration: 0,
      });

      // Generate and download PDF
      await html2pdf().set(options).from(element).save();

      message.success({
        content: "PDF exported successfully!",
        key: "pdf-export",
        duration: 3,
      });
    } catch (error) {
      console.error("Export error:", error);
      message.error({
        content: "Failed to export PDF. Please try again.",
        key: "pdf-export",
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="primary"
      size="large"
      icon={<DownloadOutlined />}
      onClick={handleExport}
      loading={loading}
      style={{
        background: "#52c41a",
        borderColor: "#52c41a",
        fontSize: "16px",
        height: "48px",
        paddingLeft: "24px",
        paddingRight: "24px",
      }}
    >
      {loading ? "Generating PDF..." : "Download PDF"}
    </Button>
  );
};

export default ExportButton;
