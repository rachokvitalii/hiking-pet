"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Spinner } from "~/components/ui/spinner";
import { formErrorsSetter } from "~/lib/form-errors";
import { appRoutes } from "~/shared/app-routes";
import { SEASONS, type Season } from "~/features/routes/types";
import {
  EXPERIENCE_LEVELS,
  EXPERIENCE_LEVEL_LABEL,
  TRIP_TYPES,
  type ExperienceLevel,
  type TripType,
} from "~/types/types";
import {
  createRouteAction,
  updateRouteAction,
} from "~/features/routes-admin/actions";
import { slugifyRouteTitle } from "~/features/routes-admin/slug";
import {
  createRouteSchema,
  type RouteFormInput,
} from "~/features/routes-admin/validation";
import { RichTextEditor } from "./rich-text-editor";

const tripTypeLabel: Record<TripType, string> = {
  hiking: "Hiking",
  camping: "Camping",
  bike_ride: "Bike ride",
};

const seasonLabel: Record<Season, string> = {
  spring: "Spring",
  summer: "Summer",
  autumn: "Autumn",
  winter: "Winter",
};

export const emptyRouteFormValues: RouteFormInput = {
  slug: "",
  title: "",
  description: "",
  region: "",
  type: [],
  difficulty: "beginner",
  latitude: 0,
  longitude: 0,
  distanceKm: 1,
  days: 1,
  elevationGain: 0,
  seasons: [],
};

type RouteFormProps = {
  mode: "create" | "edit";
  routeId?: number;
  initialValues?: RouteFormInput;
};

export function RouteForm({
  mode,
  routeId,
  initialValues = emptyRouteFormValues,
}: RouteFormProps) {
  const router = useRouter();
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const form = useForm<RouteFormInput>({
    resolver: zodResolver(createRouteSchema),
    defaultValues: initialValues,
  });

  const onSubmit = async (data: RouteFormInput) => {
    const result =
      mode === "create"
        ? await createRouteAction(data)
        : await updateRouteAction({ id: routeId ?? 0, ...data });

    if (!result.ok) {
      formErrorsSetter<RouteFormInput>(result.issues, form.setError);
      return;
    }

    if (result.embedError) {
      toast.warning(`Route saved, but embedding failed: ${result.embedError}`);
    } else {
      toast.success(mode === "create" ? "Route created" : "Route saved");
    }

    if (mode === "create") {
      router.push(appRoutes.adminEditRoute(result.routeId));
      return;
    }

    router.refresh();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldSet disabled={form.formState.isSubmitting}>
        <FieldGroup>
          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <FieldContent>
                  <Input
                    id="title"
                    {...field}
                    onChange={(event) => {
                      const nextTitle = event.target.value;
                      field.onChange(nextTitle);

                      if (!isSlugManuallyEdited) {
                        form.setValue("slug", slugifyRouteTitle(nextTitle), {
                          shouldDirty: true,
                          shouldValidate: form.formState.isSubmitted,
                        });
                      }
                    }}
                    aria-invalid={fieldState.invalid}
                  />
                </FieldContent>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="slug"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="slug">Slug</FieldLabel>
                <FieldContent>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      {...field}
                      onChange={(event) => {
                        setIsSlugManuallyEdited(
                          event.target.value.trim().length > 0,
                        );
                        field.onChange(slugifyRouteTitle(event.target.value));
                      }}
                      aria-invalid={fieldState.invalid}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        field.onChange(
                          slugifyRouteTitle(form.getValues("title")),
                        );
                        setIsSlugManuallyEdited(false);
                      }}
                    >
                      Use title
                    </Button>
                  </div>
                </FieldContent>
                <FieldDescription>
                  Auto-generated from title until edited manually.
                </FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <FieldContent>
                  <RichTextEditor
                    id="description"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    aria-invalid={fieldState.invalid}
                    disabled={form.formState.isSubmitting}
                  />
                </FieldContent>
                <FieldDescription>
                  Styled text is saved as HTML. Embeddings use the visible text
                  only.
                </FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="region"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="region">Region</FieldLabel>
                <FieldContent>
                  <Input
                    id="region"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                </FieldContent>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="difficulty"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Difficulty</FieldLabel>
                <FieldContent>
                  <Select
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value as ExperienceLevel)
                    }
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {EXPERIENCE_LEVEL_LABEL[level]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FieldContent>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <NumberField
              control={form.control}
              name="latitude"
              label="Latitude"
              step="0.000001"
            />
            <NumberField
              control={form.control}
              name="longitude"
              label="Longitude"
              step="0.000001"
            />
            <NumberField
              control={form.control}
              name="distanceKm"
              label="Distance, km"
              min={1}
            />
            <NumberField
              control={form.control}
              name="days"
              label="Days"
              min={1}
            />
            <NumberField
              control={form.control}
              name="elevationGain"
              label="Elevation gain, m"
              min={0}
            />
          </div>

          <Controller
            control={form.control}
            name="type"
            render={({ field, fieldState }) => (
              <FieldSet data-invalid={fieldState.invalid}>
                <FieldLegend>Route type</FieldLegend>
                <FieldGroup data-slot="checkbox-group">
                  {TRIP_TYPES.map((type) => (
                    <Field key={type} orientation="horizontal">
                      <Checkbox
                        id={`type-${type}`}
                        checked={field.value.includes(type)}
                        onCheckedChange={(checked) => {
                          field.onChange(
                            checked
                              ? [...field.value, type]
                              : field.value.filter((value) => value !== type),
                          );
                        }}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldLabel htmlFor={`type-${type}`}>
                        {tripTypeLabel[type]}
                      </FieldLabel>
                    </Field>
                  ))}
                </FieldGroup>
                <FieldError errors={[fieldState.error]} />
              </FieldSet>
            )}
          />

          <Controller
            control={form.control}
            name="seasons"
            render={({ field, fieldState }) => (
              <FieldSet data-invalid={fieldState.invalid}>
                <FieldLegend>Seasons</FieldLegend>
                <FieldGroup data-slot="checkbox-group">
                  {SEASONS.map((season) => (
                    <Field key={season} orientation="horizontal">
                      <Checkbox
                        id={`season-${season}`}
                        checked={field.value.includes(season)}
                        onCheckedChange={(checked) => {
                          field.onChange(
                            checked
                              ? [...field.value, season]
                              : field.value.filter((value) => value !== season),
                          );
                        }}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldLabel htmlFor={`season-${season}`}>
                        {seasonLabel[season]}
                      </FieldLabel>
                    </Field>
                  ))}
                </FieldGroup>
                <FieldError errors={[fieldState.error]} />
              </FieldSet>
            )}
          />

          {form.formState.errors.root?.message && (
            <FieldError>{form.formState.errors.root.message}</FieldError>
          )}

          <Field orientation="horizontal">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Spinner data-icon="inline-start" />
              )}
              {mode === "create" ? "Create route" : "Save route"}
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}

type NumberFieldName =
  | "latitude"
  | "longitude"
  | "distanceKm"
  | "days"
  | "elevationGain";

type NumberFieldProps = {
  control: ReturnType<typeof useForm<RouteFormInput>>["control"];
  name: NumberFieldName;
  label: string;
  min?: number;
  step?: string;
};

function NumberField({ control, name, label, min, step }: NumberFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <FieldContent>
            <Input
              id={name}
              type="number"
              value={field.value}
              min={min}
              step={step}
              onBlur={field.onBlur}
              onChange={(event) => field.onChange(Number(event.target.value))}
              aria-invalid={fieldState.invalid}
            />
          </FieldContent>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}
