import { useTranslation } from "react-i18next";
import { useState } from "react";
import { FileUpload, Field } from "@chakra-ui/react";
import { LuUpload, LuFile, LuX, LuImagePlus, LuEye } from "react-icons/lu";
import { CusDialog } from "@/components/ui/dialog/CusDialog";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CusFileUploadProps {
  // Label & validation
  label?: string;
  sublabel?: string;
  isRequired?: boolean;
  errorText?: string;
  helperText?: string;

  // File constraints
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxFileSize?: number;
  minFileSize?: number;

  // Behavior
  disabled?: boolean;
  variant?: "button" | "dropzone";
  placeholder?: string;
  buttonText?: string;

  // Current image(s) (edit mode)
  currentImageUrl?: string;
  currentImageUrls?: string[];
  onRemoveCurrentImageUrl?: (index: number) => void;

  // Callbacks
  onFileChange?: (files: File[]) => void;
  onFileAccept?: (details: { files: File[] }) => void;
  onFileReject?: (details: { files: unknown[] }) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CusFileUpload({
  label,
  sublabel,
  isRequired,
  errorText,
  helperText,
  accept,
  maxFiles = 1,
  maxFileSize,
  minFileSize,
  disabled,
  variant = "button",
  placeholder,
  buttonText,
  currentImageUrl,
  currentImageUrls,
  onRemoveCurrentImageUrl,
  onFileChange,
  onFileAccept,
  onFileReject,
}: CusFileUploadProps) {
  const { t } = useTranslation();
  const isInvalid = !!errorText;
  const borderColor = isInvalid ? "var(--color-red)" : "var(--border-input)";

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function openPreview(file: File) {
    setPreviewUrl(URL.createObjectURL(file));
  }
  function closePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }

  return (
    <Field.Root invalid={isInvalid} required={isRequired} width="100%">
      {label && (
        <Field.Label
          fontSize="sm"
          fontWeight="medium"
          mb="1"
          color="var(--text-3)"
        >
          {label}
          <Field.RequiredIndicator color="var(--color-red)" ml="0.5" />
        </Field.Label>
      )}
      {sublabel && (
        <p
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            marginTop: -2,
            marginBottom: 6,
          }}
        >
          {sublabel}
        </p>
      )}

      <FileUpload.Root
        accept={accept}
        maxFiles={maxFiles}
        maxFileSize={maxFileSize}
        minFileSize={minFileSize}
        disabled={disabled}
        invalid={isInvalid}
        width="100%"
        onFileChange={(details) => onFileChange?.(details.acceptedFiles)}
        onFileAccept={onFileAccept as never}
        onFileReject={onFileReject as never}
      >
        <FileUpload.HiddenInput />

        {variant === "dropzone" ? (
          <FileUpload.Dropzone
            style={{
              border: `1.5px dashed ${borderColor}`,
              borderRadius: 8,
              padding: "28px 16px",
              background: "var(--bg-input)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.5 : 1,
              transition: "border-color 0.15s, background 0.15s",
            }}
          >
            <LuImagePlus size={24} style={{ color: "var(--text-muted)" }} />
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text-2)",
                }}
              >
                {placeholder ?? t("ui.fileUpload.dropHere")}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                {[
                  maxFiles > 1 ? t("ui.fileUpload.maxFiles", { count: maxFiles }) : null,
                  maxFileSize ? formatBytes(maxFileSize) : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <FileUpload.Trigger asChild>
              <button
                type="button"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--color-blue)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                {t("ui.fileUpload.orChoose")}
              </button>
            </FileUpload.Trigger>
          </FileUpload.Dropzone>
        ) : (
          <FileUpload.Trigger asChild>
            <button
              type="button"
              disabled={disabled}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 12px",
                border: `1px solid ${borderColor}`,
                borderRadius: 6,
                background: "var(--bg-input)",
                color: "var(--text-2)",
                fontSize: 13,
                fontWeight: 500,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
                transition: "border-color 0.15s",
              }}
            >
              <LuUpload size={13} />
              {buttonText ??
                placeholder ??
                (maxFiles > 1 ? t("ui.fileUpload.chooseFiles") : t("ui.fileUpload.chooseFile"))}
            </button>
          </FileUpload.Trigger>
        )}

        {/* File list */}
        <FileUpload.ItemGroup>
          <FileUpload.Context>
            {({ acceptedFiles }) => (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: acceptedFiles.length > 0 || currentImageUrl ? 8 : 0,
                }}
              >
                {/* Current images — multiple (galereya) — har doim ko'rinadi */}
                {currentImageUrls &&
                  currentImageUrls.map((url, i) => (
                    <div
                      key={url}
                      style={{ position: "relative", width: 150, height: 110, flexShrink: 0 }}
                      onMouseEnter={() => setHoveredKey(`__current_${i}__`)}
                      onMouseLeave={() => setHoveredKey(null)}
                    >
                      <img
                        src={url}
                        alt={`current-${i}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 8,
                          objectFit: "cover",
                          display: "block",
                          border: "1px solid var(--border-default)",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          bottom: 5,
                          left: 6,
                          fontSize: 10,
                          fontWeight: 600,
                          color: "var(--text-on-accent)",
                          background: "var(--overlay-hover)",
                          borderRadius: 4,
                          padding: "1px 5px",
                          pointerEvents: "none",
                        }}
                      >
                        {i + 1}/{currentImageUrls.length}
                      </span>
                      {/* Preview overlay */}
                      <button
                        type="button"
                        onClick={() => setPreviewUrl(url)}
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: 8,
                          border: "none",
                          background: "var(--overlay-hover)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "opacity 0.15s",
                          opacity: hoveredKey === `__current_${i}__` ? 1 : 0,
                        }}
                      >
                        <LuEye size={20} color="var(--text-on-accent)" />
                      </button>
                      {/* X — delete button */}
                      {onRemoveCurrentImageUrl && (
                        <button
                          type="button"
                          onClick={() => onRemoveCurrentImageUrl(i)}
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "var(--bg-second)",
                            border: "1px solid var(--border-default)",
                            cursor: "pointer",
                            color: "var(--text-2)",
                            boxShadow: "var(--shadow-sm)",
                          }}
                        >
                          <LuX size={10} />
                        </button>
                      )}
                    </div>
                  ))}

                {/* Current image (server) — faqat yangi fayl tanlanmagan bo'lsa */}
                {acceptedFiles.length === 0 && currentImageUrl && (
                  <div
                    style={{ position: "relative", width: 150, height: 110, flexShrink: 0 }}
                    onMouseEnter={() => setHoveredKey("__current__")}
                    onMouseLeave={() => setHoveredKey(null)}
                  >
                    <img
                      src={currentImageUrl}
                      alt="current"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 8,
                        objectFit: "cover",
                        display: "block",
                        border: "1px solid var(--border-default)",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        bottom: 5,
                        left: 6,
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-on-accent)",
                        background: "var(--overlay-hover)",
                        borderRadius: 4,
                        padding: "1px 5px",
                        pointerEvents: "none",
                      }}
                    >
                      {t("ui.fileUpload.current")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewUrl(currentImageUrl)}
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 8,
                        border: "none",
                        background: "var(--overlay-hover)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "opacity 0.15s",
                        opacity: hoveredKey === "__current__" ? 1 : 0,
                      }}
                    >
                      <LuEye size={20} color="var(--text-on-accent)" />
                    </button>
                  </div>
                )}

                {acceptedFiles.map((file) =>
                  file.type.startsWith("image/") ? (
                    // Image → thumbnail + hover preview + X overlay
                    (() => {
                      const itemKey = `${file.name}-${file.size}`;
                      const isHovered = hoveredKey === itemKey;
                      return (
                        <FileUpload.Item
                          key={itemKey}
                          file={file}
                          style={{
                            position: "relative",
                            width: 150,
                            height: 110,
                            flexShrink: 0,
                          }}
                          onMouseEnter={() => setHoveredKey(itemKey)}
                          onMouseLeave={() => setHoveredKey(null)}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: 8,
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                          {/* Hover preview overlay */}
                          <button
                            type="button"
                            onClick={() => openPreview(file)}
                            style={{
                              position: "absolute",
                              inset: 0,
                              borderRadius: 8,
                              border: "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "background 0.15s",
                              opacity: isHovered ? 1 : 0,
                            }}
                          >
                            <LuEye size={20} color="var(--text-on-accent)" />
                          </button>
                          {/* X button */}
                          <FileUpload.ItemDeleteTrigger asChild>
                            <button
                              type="button"
                              style={{
                                position: "absolute",
                                top: -6,
                                right: -6,
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "var(--bg-second)",
                                border: "1px solid var(--border-default)",
                                cursor: "pointer",
                                color: "var(--text-2)",
                                boxShadow: "var(--shadow-sm)",
                              }}
                            >
                              <LuX size={10} />
                            </button>
                          </FileUpload.ItemDeleteTrigger>
                        </FileUpload.Item>
                      );
                    })()
                  ) : (
                    // Non-image → row with name + size
                    <FileUpload.Item
                      key={`${file.name}-${file.size}`}
                      file={file}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 8px",
                        borderRadius: 6,
                        background: "var(--bg-hover)",
                        border: "1px solid var(--border-default)",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: "var(--text-muted)",
                        }}
                      >
                        <LuFile size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <FileUpload.ItemName
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "var(--text-default)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "block",
                          }}
                        />
                        <FileUpload.ItemSizeText
                          style={{ fontSize: 11, color: "var(--text-muted)" }}
                        />
                      </div>
                      <FileUpload.ItemDeleteTrigger asChild>
                        <button
                          type="button"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: 4,
                            borderRadius: 4,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--text-muted)",
                            flexShrink: 0,
                          }}
                        >
                          <LuX size={13} />
                        </button>
                      </FileUpload.ItemDeleteTrigger>
                    </FileUpload.Item>
                  ),
                )}
              </div>
            )}
          </FileUpload.Context>
        </FileUpload.ItemGroup>
      </FileUpload.Root>

      {errorText && (
        <Field.ErrorText fontSize="xs" color="var(--color-red)" mt="1">
          {errorText}
        </Field.ErrorText>
      )}

      {helperText && !errorText && (
        <Field.HelperText fontSize="xs" color="var(--text-muted)" mt="1">
          {helperText}
        </Field.HelperText>
      )}

      <CusDialog
        open={!!previewUrl}
        onClose={closePreview}
        size="lg"
        closeOnBackdrop
      >
        {previewUrl && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={previewUrl}
              alt="preview"
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                borderRadius: 10,
                objectFit: "contain",
              }}
            />
          </div>
        )}
      </CusDialog>
    </Field.Root>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Ishlatish misoli ─────────────────────────────────────────────────────────

// ✅ Oddiy button variant (1 ta fayl)
// <CusFileUpload
//   label="Rasm"
//   isRequired
//   accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }}
//   onFileChange={(files) => console.log(files)}
// />

// ✅ Dropzone (bir nechta fayl)
// <CusFileUpload
//   label="Fayllar"
//   variant="dropzone"
//   maxFiles={5}
//   maxFileSize={5 * 1024 * 1024}
//   accept={{ "image/*": [".jpg", ".png"] }}
//   onFileChange={(files) => console.log(files)}
// />

// ✅ react-hook-form Controller bilan
// <Controller
//   control={control}
//   name="main_file"
//   render={({ field, fieldState }) => (
//     <CusFileUpload
//       label="Asosiy rasm"
//       isRequired
//       accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }}
//       maxFileSize={5 * 1024 * 1024}
//       errorText={fieldState.error?.message}
//       onFileChange={(files) => field.onChange(files[0] ?? null)}
//     />
//   )}
// />

// ✅ Ko'p fayllar uchun Controller
// <Controller
//   control={control}
//   name="files"
//   render={({ field, fieldState }) => (
//     <CusFileUpload
//       label="Galereya rasmlari"
//       variant="dropzone"
//       maxFiles={10}
//       accept={{ "image/*": [".jpg", ".png", ".webp"] }}
//       errorText={fieldState.error?.message}
//       onFileChange={(files) => field.onChange(files)}
//     />
//   )}
// />
