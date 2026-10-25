"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  CircleAlert,
  Eye,
  Info,
  MapPin,
  Plus,
  Save,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import type { AmenityId, PropertyImage, RoomCapacity, RoomGradeId } from "@/types/property";
import type { DraftRoom, LandlordDraft } from "@/types/marketplace";
import { UNIVERSITIES, getUniversity } from "@/data/universities";
import {
  ACCOMMODATION_TYPES,
  AMENITIES,
  BATHROOM_ARRANGEMENTS,
  FURNISHING_LEVELS,
  PRICING_BASES,
  ROOM_AMENITY_IDS,
  ROOM_CAPACITIES,
  ROOM_GRADES,
} from "@/data/meta";
import { formatNaira } from "@/lib/format-currency";
import {
  DRAFT_RULE_KEYS,
  DRAFT_RULE_LABELS,
  createEmptyDraft,
  createEmptyDraftRoom,
  draftToProperty,
  validateDraft,
  validateGeneratedProperty,
} from "@/lib/listing-draft";
import { useDraft, useLocalListings, saveLocalListing, writeDraft } from "@/lib/marketplace-store";
import { roomAvailability, roomPriceFor } from "@/lib/rooms";
import { PlacePicker } from "@/components/maps/place-picker";
import { ImageUploader } from "@/components/landlord/image-uploader";
import { DemoBadge, DemoNotice } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { CheckboxRow, Field, SelectInput, TextInput, inputClasses } from "@/components/ui/field";
import { cn } from "@/lib/cn";

const STEPS = [
  { id: 1, title: "Property basics", short: "Basics" },
  { id: 2, title: "Rules & contact", short: "Rules" },
  { id: 3, title: "Location", short: "Location" },
  { id: 4, title: "Rooms & pricing", short: "Rooms" },
  { id: 5, title: "Photos & amenities", short: "Photos" },
  { id: 6, title: "Review & preview", short: "Review" },
  { id: 7, title: "Save & publish", short: "Publish" },
];

export function ListingWizard() {
  const stored = useDraft();
  const localListings = useLocalListings();
  const [step, setStep] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [saveNotice, setSaveNotice] = useState("");
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const photoInputId = useId();

  useEffect(() => {
    if (stored.ready && stored.value == null) {
      writeDraft(createEmptyDraft());
    }
  }, [stored.ready, stored.value]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  if (!stored.ready || stored.value == null) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="h-8 w-64 animate-pulse rounded bg-surface-2" />
        <div className="mt-6 h-72 animate-pulse rounded-2xl bg-surface-2" />
      </div>
    );
  }

  const draft = stored.value;
  const validation = validateDraft(draft);
  const currentErrors = validation.stepErrors[step] ?? [];
  const totalErrors = validation.errors.length;

  function update(patch: Partial<LandlordDraft>) {
    writeDraft({ ...draft, ...patch, updatedAt: new Date().toISOString() });
  }

  function updateRoom(roomId: string, patch: Partial<DraftRoom>) {
    update({
      rooms: draft.rooms.map((room) => (room.id === roomId ? { ...room, ...patch } : room)),
    });
  }

  function goNext() {
    if (currentErrors.length > 0) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep((current) => Math.min(STEPS.length, current + 1));
  }

  function saveDraft() {
    writeDraft({ ...draft, updatedAt: new Date().toISOString() });
    setSaveNotice("Draft saved in this browser only (demo). Nothing was sent to a server.");
  }

  function publish() {
    const property = draftToProperty(draft, "published");
    const errors = [...validation.errors, ...validateGeneratedProperty(property)];
    if (errors.length > 0) {
      setPublishedId(null);
      setSaveNotice(
        `This listing cannot be published yet: ${errors[0]} Use the step links above to fix the remaining ${errors.length} issue${errors.length === 1 ? "" : "s"}.`,
      );
      return;
    }
    const existing = localListings.value.find((record) => record.property.id === property.id);
    saveLocalListing({
      property,
      status: "published-demo",
      completeness: validation.completeness,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setPublishedId(property.id);
    setSaveNotice(
      "Saved as a local demo listing. It appears in search on this browser only and is not published to OFFK.",
    );
  }

  function clearDraft() {
    if (
      !window.confirm(
        "Clear this local draft? Uploaded images and room configurations in the draft will be removed. Published local listings stay in the browser.",
      )
    ) {
      return;
    }
    writeDraft(createEmptyDraft());
    setPublishedId(null);
    setSaveNotice("Draft cleared (demo).");
    setStep(1);
  }

  const previewProperty = draftToProperty(draft, "published");
  const previewRoom = previewProperty.rooms[0];
  const primaryUniversity = getUniversity(draft.universityIds[0] ?? "nile");
  const previewPrice =
    previewRoom && primaryUniversity
      ? roomPriceFor(previewRoom, primaryUniversity.id, primaryUniversity.sessionPeriods.basePeriod, primaryUniversity)
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
            Landlord workspace · demo
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            List a student property
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            A seven-step room-aware listing flow. Your draft, photos and published test
            listing are stored in this browser only. Nothing is sent to OFFK or a landlord
            network.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <DemoBadge />
          <div className="text-right">
            <p className="text-xs text-faint">Draft completeness</p>
            <p className="font-display text-xl font-semibold text-ink">
              {validation.completeness}%
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <DemoNotice title="Local demo workflow">
          Publishing here means “saved to this browser”. It is not a permanent publication,
          does not alert a real landlord and will disappear if browser storage is cleared.
          Google Places and Paystack are optional and shown honestly when unconfigured.
        </DemoNotice>
      </div>

      <nav aria-label="Listing steps" className="mt-6 overflow-x-auto">
        <ol className="flex min-w-max items-center gap-1">
          {STEPS.map((item, index) => {
            const hasErrors = Boolean(validation.stepErrors[item.id]?.length);
            const done = item.id < step && !hasErrors;
            return (
              <li key={item.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowErrors(false);
                    setStep(item.id);
                  }}
                  aria-current={step === item.id ? "step" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    step === item.id
                      ? "border-brand bg-brand text-on-brand"
                      : done
                        ? "border-success/30 bg-success-soft text-success"
                        : hasErrors
                          ? "border-warning/40 bg-warning-soft text-warning"
                          : "border-line bg-surface text-muted hover:bg-surface-2",
                  )}
                >
                  <span className="grid size-5 place-items-center rounded-full border border-current text-[10px]">
                    {done ? <Check className="size-3" aria-hidden="true" /> : item.id}
                  </span>
                  {item.short}
                </button>
                {index < STEPS.length - 1 ? <span className="h-px w-4 bg-line" /> : null}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-brand transition-[width]"
          style={{ width: `${(step / STEPS.length) * 100}%` }}
        />
      </div>

      {showErrors && currentErrors.length > 0 ? (
        <div className="mt-5 rounded-xl border border-danger/30 bg-danger-soft p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-danger">
            <CircleAlert className="size-4" aria-hidden="true" />
            Fix {currentErrors.length} issue{currentErrors.length === 1 ? "" : "s"} on this step
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-danger">
            {currentErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {publishedId ? (
        <div className="mt-5 rounded-xl border border-success/30 bg-success-soft p-5">
          <p className="flex items-center gap-2 font-semibold text-success">
            <CheckCircle2 className="size-5" aria-hidden="true" />
            Local demo listing published
          </p>
          <p className="mt-2 text-sm text-success">
            {saveNotice}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/properties/${publishedId}`} className={buttonClasses("primary", "sm")}>
              <Eye className="size-4" aria-hidden="true" />
              Open student-facing page
            </Link>
            <Link href="/landlord" className={buttonClasses("outline", "sm")}>
              Back to landlord dashboard
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">
              Step {step} of {STEPS.length}
            </p>
            <h2 className="font-display mt-1 text-2xl font-semibold text-ink">
              {STEPS[step - 1].title}
            </h2>
          </div>
          <span className="text-xs text-faint">Autosaved in this browser</span>
        </div>

        <div className="mt-6">
          {step === 1 ? (
            <StepBasics draft={draft} update={update} />
          ) : step === 2 ? (
            <StepRules draft={draft} update={update} />
          ) : step === 3 ? (
            <div className="space-y-4">
              <PlacePicker value={draft.location} onChange={(location) => update({ location })} />
              <div className="rounded-xl border border-line bg-surface-2 p-4 text-sm">
                <p className="flex items-center gap-2 font-medium text-ink">
                  <MapPin className="size-4" aria-hidden="true" />
                  Saved location state
                </p>
                <p className="mt-1 text-muted">
                  {draft.location.mode === "google"
                    ? `Google-verified selection · Place ID ${draft.location.placeId ?? "missing"}`
                    : draft.location.mode === "demo"
                      ? "Demo location selected — explicitly unverified."
                      : "No location selected yet."}
                </p>
                <p className="mt-2 text-xs text-faint">{draft.location.note}</p>
              </div>
            </div>
          ) : step === 4 ? (
            <StepRooms draft={draft} update={update} updateRoom={updateRoom} />
          ) : step === 5 ? (
            <StepPhotos draft={draft} update={update} photoInputId={photoInputId} />
          ) : step === 6 ? (
            <StepReview
              draft={draft}
              previewProperty={previewProperty}
              previewPrice={previewPrice}
              primaryUniversity={primaryUniversity}
              validation={validation}
              onGoToStep={(nextStep) => {
                setShowErrors(false);
                setStep(nextStep);
              }}
            />
          ) : (
            <StepPublish
              draft={draft}
              validation={validation}
              publishedId={publishedId}
              saveNotice={saveNotice}
              onSaveDraft={saveDraft}
              onPublish={publish}
              onClear={clearDraft}
            />
          )}
        </div>

        {step === 4 && currentErrors.length > 0 ? (
          <div className="mt-5 rounded-lg border border-warning/30 bg-warning-soft p-3 text-xs text-warning">
            <p className="flex items-center gap-1.5 font-medium">
              <TriangleAlert className="size-3.5" aria-hidden="true" />
              Room validation
            </p>
            <ul className="mt-1 list-disc pl-5">
              {currentErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setShowErrors(false);
                setStep((current) => Math.max(1, current - 1));
              }}
              disabled={step === 1}
              className={buttonClasses("outline", "sm")}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </button>
            <button type="button" onClick={saveDraft} className={buttonClasses("ghost", "sm")}>
              <Save className="size-4" aria-hidden="true" />
              Save draft
            </button>
          </div>
          <div className="flex items-center gap-3">
            {saveNotice && step !== 7 ? (
              <span className="max-w-xs text-xs text-muted">{saveNotice}</span>
            ) : null}
            {step < STEPS.length ? (
              <button type="button" onClick={goNext} className={buttonClasses("primary", "sm")}>
                Continue
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={publish}
                disabled={totalErrors > 0}
                className={buttonClasses("accent", "sm")}
                title={
                  totalErrors > 0
                    ? "Fix all validation errors before publishing the local demo listing"
                    : undefined
                }
              >
                <BadgeCheck className="size-4" aria-hidden="true" />
                Publish local demo
              </button>
            )}
          </div>
        </div>
        {step === STEPS.length && totalErrors > 0 ? (
          <p className="mt-3 text-right text-xs text-warning">
            {totalErrors} validation issue{totalErrors === 1 ? "" : "s"} remain. Publishing is
            disabled until they are fixed.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function StepBasics({
  draft,
  update,
}: {
  draft: LandlordDraft;
  update: (patch: Partial<LandlordDraft>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Listing name" htmlFor="listing-title">
          <TextInput
            id="listing-title"
            value={draft.title}
            onChange={(event) => update({ title: event.target.value })}
            placeholder="e.g. Jabi student house — room of 4"
          />
        </Field>
        <Field label="Area / neighbourhood" htmlFor="listing-area">
          <TextInput
            id="listing-area"
            value={draft.area}
            onChange={(event) => update({ area: event.target.value })}
            placeholder="e.g. Jabi"
          />
        </Field>
        <Field label="Accommodation type" htmlFor="listing-type">
          <SelectInput
            id="listing-type"
            value={draft.type}
            onChange={(event) =>
              update({ type: event.target.value as LandlordDraft["type"] })
            }
          >
            {ACCOMMODATION_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Furnishing" htmlFor="listing-furnishing">
          <SelectInput
            id="listing-furnishing"
            value={draft.furnishing}
            onChange={(event) =>
              update({ furnishing: event.target.value as LandlordDraft["furnishing"] })
            }
          >
            {FURNISHING_LEVELS.map((level) => (
              <option key={level.id} value={level.id}>
                {level.label}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-ink">
          Universities this property serves
        </legend>
        <p className="mt-1 text-xs text-faint">
          At least one is required. Rental periods and session maths come from each
          university.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {UNIVERSITIES.map((university) => (
            <label
              key={university.id}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3 hover:bg-surface-2"
            >
              <input
                type="checkbox"
                checked={draft.universityIds.includes(university.id)}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...new Set([...draft.universityIds, university.id])]
                    : draft.universityIds.filter((id) => id !== university.id);
                  update({ universityIds: next });
                }}
                className="mt-0.5 size-4 accent-[var(--c-btn-primary-bg)]"
              />
              <span>
                <span className="block text-sm font-medium text-ink">{university.name}</span>
                <span className="block text-xs text-faint">
                  {university.rentalPeriods.map((period) => period.shortLabel).join(" · ")}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        label="Description"
        htmlFor="listing-description"
        hint="At least 30 characters. Use blank lines to separate paragraphs."
      >
        <textarea
          id="listing-description"
          value={draft.description}
          onChange={(event) => update({ description: event.target.value })}
          rows={6}
          placeholder="Describe the property, shared spaces, who it suits and what makes each room type different."
          className={cn(inputClasses, "min-h-32 py-3")}
        />
      </Field>

      <div className="rounded-xl border border-line bg-surface-2 p-4 text-xs text-muted">
        <p className="flex items-center gap-1.5 font-medium text-ink">
          <Info className="size-3.5" aria-hidden="true" />
          Room-aware data
        </p>
        <p className="mt-1">
          Do not put bed counts only in the description. Add each room configuration in
          step 4 so capacity, spaces, pricing and photos stay together.
        </p>
      </div>
    </div>
  );
}

function StepRules({
  draft,
  update,
}: {
  draft: LandlordDraft;
  update: (patch: Partial<LandlordDraft>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Contact name" htmlFor="contact-name">
          <TextInput
            id="contact-name"
            value={draft.contactName}
            onChange={(event) => update({ contactName: event.target.value })}
          />
        </Field>
        <Field label="Contact email" htmlFor="contact-email">
          <TextInput
            id="contact-email"
            type="email"
            value={draft.contactEmail}
            onChange={(event) => update({ contactEmail: event.target.value })}
          />
        </Field>
        <Field label="Phone (optional, demo)" htmlFor="contact-phone">
          <TextInput
            id="contact-phone"
            value={draft.contactPhone}
            onChange={(event) => update({ contactPhone: event.target.value })}
            placeholder="+234…"
          />
        </Field>
        <Field label="Check-in time" htmlFor="check-in">
          <TextInput
            id="check-in"
            type="time"
            value={draft.checkInTime}
            onChange={(event) => update({ checkInTime: event.target.value })}
          />
        </Field>
        <Field label="Check-out time" htmlFor="check-out">
          <TextInput
            id="check-out"
            type="time"
            value={draft.checkOutTime}
            onChange={(event) => update({ checkOutTime: event.target.value })}
          />
        </Field>
      </div>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-medium text-ink">Enquiries and bookings</legend>
        <CheckboxRow
          id="accept-enquiries"
          label="Accept enquiries"
          description="Students can ask about a room. Submitting an enquiry does not reduce availability."
          checked={draft.acceptsEnquiries}
          onChange={(acceptsEnquiries) => update({ acceptsEnquiries })}
        />
        <CheckboxRow
          id="accept-bookings"
          label="Accept booking requests"
          description="Accepted enquiries can become a booking request. Payment is demo-only until Paystack is configured."
          checked={draft.acceptsBookings}
          onChange={(acceptsBookings) => update({ acceptsBookings })}
        />
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-ink">House rules</legend>
        <p className="mt-1 text-xs text-faint">
          These are sample rule labels. Add your own wording below if needed.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {DRAFT_RULE_KEYS.map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm hover:bg-surface-2"
            >
              <input
                type="checkbox"
                checked={draft.rules.includes(key)}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...draft.rules, key]
                    : draft.rules.filter((rule) => rule !== key);
                  update({ rules: next });
                }}
                className="size-4 accent-[var(--c-btn-primary-bg)]"
              />
              {DRAFT_RULE_LABELS[key]}
            </label>
          ))}
        </div>
        <div className="mt-3">
          <Field label="Custom rules (one per line)" htmlFor="custom-rules">
            <textarea
              id="custom-rules"
              value={draft.customRules}
              onChange={(event) => update({ customRules: event.target.value })}
              rows={3}
              placeholder="e.g. Quiet hours after 10pm"
              className={cn(inputClasses, "py-2.5")}
            />
          </Field>
        </div>
      </fieldset>
    </div>
  );
}

function StepRooms({
  draft,
  update,
  updateRoom,
}: {
  draft: LandlordDraft;
  update: (patch: Partial<LandlordDraft>) => void;
  updateRoom: (roomId: string, patch: Partial<DraftRoom>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted">
          Each configuration is one room type. Capacity is capped at 1–6. Available spaces
          are separate from capacity and cannot exceed total rooms × capacity.
        </p>
        <button
          type="button"
          onClick={() => update({ rooms: [...draft.rooms, createEmptyDraftRoom(2)] })}
          className={buttonClasses("outline", "sm")}
        >
          <Plus className="size-4" aria-hidden="true" />
          Add room type
        </button>
      </div>

      {draft.rooms.map((room, index) => (
        <RoomEditor
          key={room.id}
          room={room}
          index={index}
          canRemove={draft.rooms.length > 1}
          onChange={(patch) => updateRoom(room.id, patch)}
          onRemove={() => update({ rooms: draft.rooms.filter((entry) => entry.id !== room.id) })}
        />
      ))}
    </div>
  );
}

function RoomEditor({
  room,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  room: DraftRoom;
  index: number;
  canRemove: boolean;
  onChange: (patch: Partial<DraftRoom>) => void;
  onRemove: () => void;
}) {
  const baseId = useId();
  return (
    <details open={index === 0} className="group rounded-xl border border-line bg-surface">
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 p-4 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2 font-medium text-ink">
          <span className="grid size-7 place-items-center rounded-full bg-brand text-xs text-on-brand">
            {index + 1}
          </span>
          Room of {room.capacity} · {ROOM_GRADES.find((grade) => grade.id === room.grade)?.label}
        </span>
        <span className="flex items-center gap-2 text-xs text-faint">
          <RoomAvailabilityInline room={room} />
          {canRemove ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.preventDefault();
                onRemove();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onRemove();
                }
              }}
              className="rounded p-1 text-muted hover:bg-danger-soft hover:text-danger"
              aria-label={`Remove room ${index + 1}`}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </span>
          ) : null}
        </span>
      </summary>

      <div className="space-y-5 border-t border-line p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Capacity" htmlFor={`${baseId}-capacity`}>
            <SelectInput
              id={`${baseId}-capacity`}
              value={room.capacity}
              onChange={(event) => {
                const capacity = Number(event.target.value) as RoomCapacity;
                onChange({
                  capacity,
                  availableBeds: String(Math.min(Number(room.availableBeds) || capacity, capacity)),
                });
              }}
            >
              {ROOM_CAPACITIES.map((capacity) => (
                <option key={capacity.capacity} value={capacity.capacity}>
                  {capacity.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Grade" htmlFor={`${baseId}-grade`}>
            <SelectInput
              id={`${baseId}-grade`}
              value={room.grade}
              onChange={(event) => onChange({ grade: event.target.value as RoomGradeId })}
            >
              {ROOM_GRADES.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Pricing basis" htmlFor={`${baseId}-basis`}>
            <SelectInput
              id={`${baseId}-basis`}
              value={room.basis}
              onChange={(event) => onChange({ basis: event.target.value as DraftRoom["basis"] })}
            >
              {PRICING_BASES.map((basis) => (
                <option key={basis.id} value={basis.id}>
                  {basis.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Bathroom" htmlFor={`${baseId}-bathroom`}>
            <SelectInput
              id={`${baseId}-bathroom`}
              value={room.bathroom}
              onChange={(event) =>
                onChange({ bathroom: event.target.value as DraftRoom["bathroom"] })
              }
            >
              {BATHROOM_ARRANGEMENTS.map((bathroom) => (
                <option key={bathroom.id} value={bathroom.id}>
                  {bathroom.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Furnishing" htmlFor={`${baseId}-furnishing`}>
            <SelectInput
              id={`${baseId}-furnishing`}
              value={room.furnishing}
              onChange={(event) =>
                onChange({ furnishing: event.target.value as DraftRoom["furnishing"] })
              }
            >
              {FURNISHING_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Bed configuration" htmlFor={`${baseId}-beds`}>
            <TextInput
              id={`${baseId}-beds`}
              value={room.bedConfiguration}
              onChange={(event) => onChange({ bedConfiguration: event.target.value })}
              placeholder="e.g. 2 bunk beds · 4 bed spaces"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Total rooms of this type"
            htmlFor={`${baseId}-total-rooms`}
            hint="Used to cap available spaces."
          >
            <TextInput
              id={`${baseId}-total-rooms`}
              type="number"
              min={1}
              value={room.totalRooms}
              onChange={(event) => onChange({ totalRooms: event.target.value })}
            />
          </Field>
          <Field label="Available spaces (beds)" htmlFor={`${baseId}-available-beds`}>
            <TextInput
              id={`${baseId}-available-beds`}
              type="number"
              min={0}
              value={room.availableBeds}
              onChange={(event) => onChange({ availableBeds: event.target.value })}
            />
          </Field>
          <Field label="Rooms with a free space" htmlFor={`${baseId}-available-rooms`}>
            <TextInput
              id={`${baseId}-available-rooms`}
              type="number"
              min={0}
              value={room.availableRooms}
              onChange={(event) => onChange({ availableRooms: event.target.value })}
            />
          </Field>
        </div>

        <div className="rounded-lg border border-line bg-surface-2 p-4">
          <p className="text-sm font-medium text-ink">
            Period pricing ({room.basis === "per-person" ? "per person" : "per room"})
          </p>
          <p className="mt-1 text-xs text-faint">
            Total room and per-person amounts are stored separately. The app never divides a
            room total by capacity. Only fill the periods you actually offer.
          </p>
          <div className="mt-3 space-y-3">
            {(
              [
                ["semester", "Semester (Nile model)"],
                ["trimester", "Trimester (Baze model)"],
                ["session", "Full session (optional override)"],
              ] as const
            ).map(([period, label]) => (
              <div key={period} className="grid gap-3 sm:grid-cols-2">
                <Field label={`${label} — total room`} htmlFor={`${baseId}-${period}-total`}>
                  <TextInput
                    id={`${baseId}-${period}-total`}
                    inputMode="numeric"
                    value={room[`${period}Total` as const]}
                    onChange={(event) => onChange({ [`${period}Total`]: event.target.value })}
                    placeholder="₦ total for the room"
                  />
                </Field>
                <Field label={`${label} — per person`} htmlFor={`${baseId}-${period}-person`}>
                  <TextInput
                    id={`${baseId}-${period}-person`}
                    inputMode="numeric"
                    value={room[`${period}PerPerson` as const]}
                    onChange={(event) => onChange({ [`${period}PerPerson`]: event.target.value })}
                    placeholder="₦ per student"
                  />
                </Field>
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Field label="Refundable deposit" htmlFor={`${baseId}-deposit`}>
              <TextInput
                id={`${baseId}-deposit`}
                inputMode="numeric"
                value={room.depositAmount}
                onChange={(event) => onChange({ depositAmount: event.target.value })}
                placeholder="₦"
              />
            </Field>
            <Field label="Service charge" htmlFor={`${baseId}-service`}>
              <TextInput
                id={`${baseId}-service`}
                inputMode="numeric"
                value={room.serviceCharge}
                onChange={(event) => onChange({ serviceCharge: event.target.value })}
                placeholder="₦"
              />
            </Field>
            <Field label="Utility charge" htmlFor={`${baseId}-utility`}>
              <TextInput
                id={`${baseId}-utility`}
                inputMode="numeric"
                value={room.utilityCharge}
                onChange={(event) => onChange({ utilityCharge: event.target.value })}
                placeholder="Blank = usage-based"
              />
            </Field>
          </div>
          <div className="mt-3">
            <CheckboxRow
              id={`${baseId}-refundable`}
              label="Deposit is refundable"
              checked={room.refundableDeposit}
              onChange={(refundableDeposit) => onChange({ refundableDeposit })}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-ink">Room amenities</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {AMENITIES.filter((amenity) => ROOM_AMENITY_IDS.includes(amenity.id)).map(
              (amenity) => (
                <label
                  key={amenity.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-line px-2.5 py-1.5 text-xs hover:bg-surface-2"
                >
                  <input
                    type="checkbox"
                    checked={room.amenities.includes(amenity.id)}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? [...room.amenities, amenity.id]
                        : room.amenities.filter((id) => id !== amenity.id);
                      onChange({ amenities: next as AmenityId[] });
                    }}
                    className="size-3.5 accent-[var(--c-btn-primary-bg)]"
                  />
                  {amenity.label}
                </label>
              ),
            )}
          </div>
        </div>

        <Field label="Room-specific description" htmlFor={`${baseId}-description`}>
          <textarea
            id={`${baseId}-description`}
            value={room.description}
            onChange={(event) => onChange({ description: event.target.value })}
            rows={3}
            placeholder="What is different about this room type?"
            className={cn(inputClasses, "py-2.5")}
          />
        </Field>

        <div>
          <p className="text-sm font-medium text-ink">Room photos</p>
          <p className="mt-0.5 text-xs text-faint">
            Shown only for this room type. Leave empty and the student page will say no photos
            were uploaded — it will never borrow an unrelated photo.
          </p>
          <div className="mt-2">
            <ImageUploader
              photos={room.photos}
              onChange={(photos) => onChange({ photos })}
              max={4}
              label="Room type photos"
              hint="JPEG, PNG or WebP · max 2 MB each. Illustrative demo storage only."
            />
          </div>
        </div>
      </div>
    </details>
  );
}

function RoomAvailabilityInline({ room }: { room: DraftRoom }) {
  const beds = Number(room.availableBeds);
  if (!Number.isFinite(beds)) return <span>Availability not set</span>;
  return (
    <span className={cn(beds > 0 ? "text-success" : "text-warning")}>
      {beds} of {room.capacity} spaces
    </span>
  );
}

function StepPhotos({
  draft,
  update,
  photoInputId,
}: {
  draft: LandlordDraft;
  update: (patch: Partial<LandlordDraft>) => void;
  photoInputId: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted">
          Property photos cover the exterior and shared spaces. Room photos live with each
          room type in step 4.
        </p>
        <div className="mt-3">
          <ImageUploader
            photos={draft.photos}
            onChange={(photos: PropertyImage[]) => update({ photos })}
            max={8}
            label="Property photos"
            hint={`JPEG, PNG or WebP · max 2 MB each · ${photoInputId ? "browser storage only" : ""}`}
          />
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-ink">Property-wide amenities</legend>
        <p className="mt-1 text-xs text-faint">
          Room-specific amenities (desk, AC, en-suite) belong in step 4.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {AMENITIES.map((amenity) => (
            <label
              key={amenity.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs hover:bg-surface-2"
            >
              <input
                type="checkbox"
                checked={draft.amenities.includes(amenity.id)}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...draft.amenities, amenity.id]
                    : draft.amenities.filter((id) => id !== amenity.id);
                  update({ amenities: next as AmenityId[] });
                }}
                className="size-3.5 accent-[var(--c-btn-primary-bg)]"
              />
              {amenity.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Custom amenities (one per line)" htmlFor="custom-amenities">
        <textarea
          id="custom-amenities"
          value={draft.customAmenities}
          onChange={(event) => update({ customAmenities: event.target.value })}
          rows={3}
          placeholder="e.g. Rooftop drying area"
          className={cn(inputClasses, "py-2.5")}
        />
      </Field>

      <DemoNotice title="Ownership and photo verification are pending">
        This demo cannot verify that a photo belongs to the property. Real listings must
        require verified ownership, photo review and a report/removal process.
      </DemoNotice>
    </div>
  );
}

function StepReview({
  draft,
  previewProperty,
  previewPrice,
  primaryUniversity,
  validation,
  onGoToStep,
}: {
  draft: LandlordDraft;
  previewProperty: ReturnType<typeof draftToProperty>;
  previewPrice: ReturnType<typeof roomPriceFor>;
  primaryUniversity: ReturnType<typeof getUniversity>;
  validation: ReturnType<typeof validateDraft>;
  onGoToStep: (step: number) => void;
}) {
  const cover = draft.photos[0];
  return (
    <div className="space-y-6">
      <DemoNotice title="Student-facing preview">
        This preview is generated from your draft. It is not a live publication. Photos you
        uploaded are shown only in this browser.
      </DemoNotice>

      {validation.errors.length > 0 ? (
        <div className="rounded-xl border border-warning/40 bg-warning-soft p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-warning">
            <TriangleAlert className="size-4" aria-hidden="true" />
            {validation.errors.length} issue{validation.errors.length === 1 ? "" : "s"} before
            publishing
          </p>
          <ul className="mt-2 space-y-1 text-xs text-warning">
            {Object.entries(validation.stepErrors).map(([step, errors]) => (
              <li key={step}>
                <button
                  type="button"
                  onClick={() => onGoToStep(Number(step))}
                  className="underline underline-offset-2"
                >
                  Step {step}
                </button>
                : {errors.join(" · ")}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-xl border border-success/30 bg-success-soft p-4 text-sm text-success">
          All validation checks pass for this local demo listing.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="relative aspect-[16/9] bg-surface-2">
          {cover ? (
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 p-6 text-center text-sm text-muted">
              <MapPin className="size-6 text-faint" aria-hidden="true" />
              No property photos uploaded yet
              <span className="text-xs text-faint">
                The student page will show an honest empty state.
              </span>
            </div>
          )}
          <span className="absolute top-3 left-3">
            <DemoBadge />
          </span>
        </div>
        <div className="p-5">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">
            {draft.area || "Area not set"} ·{" "}
            {previewProperty.universityIds
              .map((id) => getUniversity(id).shortName)
              .join(" & ")}
          </p>
          <h3 className="font-display mt-1 text-2xl font-semibold text-ink">
            {draft.title || "Untitled local demo listing"}
          </h3>
          <p className="mt-2 text-sm text-muted">
            {previewPrice
              ? `${formatNaira(
                  previewPrice.price.basis === "per-person"
                    ? (previewPrice.price.perPersonAmount ?? 0)
                    : (previewPrice.price.totalAmount ?? 0),
                )} ${
                  previewPrice.price.basis === "per-person" ? "per person" : "per room"
                } / ${primaryUniversity.sessionPeriods.basePeriod}`
              : "No price for the primary university yet"}
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {previewProperty.rooms.map((room) => {
              const availability = roomAvailability(room);
              return (
                <li key={room.id} className="rounded-lg border border-line p-3 text-sm">
                  <p className="font-medium text-ink">{room.name}</p>
                  <p className="text-xs text-faint">
                    Capacity {room.capacity} · {availability.label} · {room.bedConfiguration}
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 rounded-lg bg-surface-2 p-3 text-xs text-muted">
            <p className="font-medium text-ink">Location</p>
            <p className="mt-1">
              {draft.location.mode === "google"
                ? `Google Place selected: ${draft.location.formattedAddress}`
                : draft.location.mode === "demo"
                  ? `Demo location (unverified): ${draft.location.formattedAddress}`
                  : "No location selected."}
            </p>
            {draft.location.placeId ? (
              <p className="mt-1 font-mono text-[11px] text-faint">
                Place ID: {draft.location.placeId}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ReviewRow label="Property photos" value={`${draft.photos.length} uploaded`} />
        <ReviewRow
          label="Room photos"
          value={`${draft.rooms.reduce((sum, room) => sum + room.photos.length, 0)} uploaded`}
        />
        <ReviewRow label="Property amenities" value={`${draft.amenities.length} selected`} />
        <ReviewRow
          label="Room configurations"
          value={`${draft.rooms.length} type${draft.rooms.length === 1 ? "" : "s"}`}
        />
        <ReviewRow label="Check-in / out" value={`${draft.checkInTime} / ${draft.checkOutTime}`} />
        <ReviewRow
          label="Enquiries / bookings"
          value={`${draft.acceptsEnquiries ? "Enquiries on" : "Enquiries off"} · ${
            draft.acceptsBookings ? "Booking requests on" : "Booking requests off"
          }`}
        />
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );
}

function StepPublish({
  draft,
  validation,
  publishedId,
  saveNotice,
  onSaveDraft,
  onPublish,
  onClear,
}: {
  draft: LandlordDraft;
  validation: ReturnType<typeof validateDraft>;
  publishedId: string | null;
  saveNotice: string;
  onSaveDraft: () => void;
  onPublish: () => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-line bg-surface-2 p-5">
        <p className="font-display text-xl font-semibold text-ink">
          {draft.title || "Untitled local demo listing"}
        </p>
        <p className="mt-1 text-sm text-muted">
          {draft.area || "Area not set"} ·{" "}
          {draft.universityIds.length > 0
            ? draft.universityIds.map((id) => getUniversity(id).shortName).join(" & ")
            : "No university selected"}
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-faint">Completeness</dt>
            <dd className="font-display text-lg font-semibold text-ink">
              {validation.completeness}%
            </dd>
          </div>
          <div>
            <dt className="text-xs text-faint">Rooms</dt>
            <dd className="font-display text-lg font-semibold text-ink">
              {draft.rooms.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-faint">Validation</dt>
            <dd
              className={cn(
                "font-display text-lg font-semibold",
                validation.errors.length === 0 ? "text-success" : "text-warning",
              )}
            >
              {validation.errors.length === 0
                ? "Ready"
                : `${validation.errors.length} issue${validation.errors.length === 1 ? "" : "s"}`}
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={onSaveDraft} className={buttonClasses("outline", "md")}>
          <Save className="size-4" aria-hidden="true" />
          Save draft in this browser
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={validation.errors.length > 0}
          className={buttonClasses("accent", "md")}
        >
          <BadgeCheck className="size-4" aria-hidden="true" />
          Publish local demo listing
        </button>
      </div>

      <DemoNotice title="What “publish” means here">
        The listing is written to this browser's localStorage and merged into search and
        detail pages for this browser. It is not sent to a server, not visible to other
        devices, not moderated, and not a permanent publication. A production launch needs
        Supabase persistence, authenticated landlord ownership verification, moderation and
        server-side availability rules.
      </DemoNotice>

      {validation.errors.length > 0 ? (
        <div className="rounded-xl border border-warning/40 bg-warning-soft p-4 text-sm text-warning">
          Publishing is disabled because {validation.errors.length} validation issue
          {validation.errors.length === 1 ? "" : "s"} remain. Open the previous steps and fix
          them first.
        </div>
      ) : null}

      {publishedId ? (
        <div className="rounded-xl border border-success/30 bg-success-soft p-4 text-sm text-success">
          Published locally with id <span className="font-mono">{publishedId}</span>.{" "}
          <Link href={`/properties/${publishedId}`} className="underline underline-offset-2">
            Open the demo listing
          </Link>
          .
        </div>
      ) : null}

      {saveNotice ? <p className="text-xs text-muted">{saveNotice}</p> : null}

      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-danger hover:underline"
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
        Clear this local draft
      </button>
    </div>
  );
}
