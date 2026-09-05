"use client";

import { Button } from "@/components/button/button.component";
import { Input } from "@/components/forms/inputs/input.component";
import { Radio } from "@/components/forms/Radio";

export interface PersonalDetails {
  gender: string;
  fullName: string;
  dateOfBirth: string;
  correspondenceName: string;
  email: string;
  countryResidence: string;
  postalCode: string;
  houseNumber: string;
  address: string;
  streetName: string;
  placeOfResidence: string;
  phoneNumber: string;
}

export interface StepTwoProps {
  personal: PersonalDetails;
  handlePersonalChange: (field: keyof PersonalDetails, value: string) => void;
  allPersonalRequired: boolean;
  handleContinue: () => void;
  active: boolean;
}

export function StepTwo({
  personal,
  handlePersonalChange,
  allPersonalRequired,
  handleContinue,
  active,
}: StepTwoProps) {
  return (
    active && (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleContinue();
        }}
        className="flex flex-col gap-[22px] mt-6 xl:mt-10"
      >
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Enter your personal details
          </h2>
          <p className="text-sm text-text-secondary ">
            Enter your personal details as stated on your passport, ID card or
            driver&apos;s license.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text-primary">Gender</span>
          <div className="flex flex-col gap-4">
            {["man", "woman"].map((val) => (
              <Radio
                key={val}
                name="personal-gender"
                value={val}
                checked={personal.gender === val}
                onChange={() => handlePersonalChange("gender", val)}
                labelClassName="text-sm text-text-primary"
              >
                {val === "man" ? "Man" : "Woman"}
              </Radio>
            ))}
          </div>
        </div>

        <div className="grid  gap-4">
          <Input
            id="fullName"
            name="fullName"
            label="Full name"
            type="text"
            value={personal.fullName}
            onChange={(e) => handlePersonalChange("fullName", e.target.value)}
            placeholder="Full name"
            inputClassName="text-sm py-2.5"
          />
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            label="Date of birth"
            type="text"
            value={personal.dateOfBirth}
            onChange={(e) =>
              handlePersonalChange("dateOfBirth", e.target.value)
            }
            placeholder="DD-MM-YYYY"
            inputClassName="text-sm py-2.5"
          />
          <Input
            id="correspondenceName"
            name="correspondenceName"
            label="Correspondence name"
            type="text"
            value={personal.correspondenceName}
            onChange={(e) =>
              handlePersonalChange("correspondenceName", e.target.value)
            }
            placeholder="Correspondence name"
            inputClassName="text-sm py-2.5"
          />
        </div>

        <div className="bg-[#FDF2F4] rounded-lg p-4 sm:p-6 w-full">
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            Email address
          </h3>
          <p className="text-xs text-text-secondary mb-3">
            A valid email address is required to arrange your donation
            arrangements. Please ensure you enter it correctly.
          </p>
          <Input
            id="email"
            name="email"
            type="email"
            value={personal.email}
            onChange={(e) => handlePersonalChange("email", e.target.value)}
            placeholder="Email address *"
            required
            inputClassName="text-sm py-2.5 bg-white"
          />
        </div>

        <h2 className="text-lg font-semibold text-text-primary mt-2">
          Enter your personal details
        </h2>
        <div className="flex flex-col gap-2 -mt-2">
          <div className="flex flex-col gap-4">
            <Radio
              name="countryResidence"
              value="nigeria"
              checked={personal.countryResidence === "nigeria"}
              onChange={() =>
                handlePersonalChange("countryResidence", "nigeria")
              }
              labelClassName="text-sm text-text-primary"
            >
              I live in Nigeria
            </Radio>
            <Radio
              name="countryResidence"
              value="abroad"
              checked={personal.countryResidence === "abroad"}
              onChange={() =>
                handlePersonalChange("countryResidence", "abroad")
              }
              labelClassName="text-sm text-text-primary"
            >
              I live abroad
            </Radio>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            id="postalCode"
            name="postalCode"
            label="Postal code"
            type="text"
            value={personal.postalCode}
            onChange={(e) => handlePersonalChange("postalCode", e.target.value)}
            placeholder="Postal code"
            inputClassName="text-sm py-2.5"
          />
          <Input
            id="houseNumber"
            name="houseNumber"
            label="House number *"
            type="text"
            value={personal.houseNumber}
            onChange={(e) =>
              handlePersonalChange("houseNumber", e.target.value)
            }
            placeholder="House number*"
            required
            inputClassName="text-sm py-2.5"
          />
          <Input
            id="address"
            name="address"
            label="Address"
            type="text"
            value={personal.address}
            onChange={(e) => handlePersonalChange("address", e.target.value)}
            placeholder="Address"
            inputClassName="text-sm py-2.5"
          />
        </div>
        <div className="grid  gap-4">
          <Input
            id="streetName"
            name="streetName"
            label="Street name *"
            type="text"
            value={personal.streetName}
            onChange={(e) => handlePersonalChange("streetName", e.target.value)}
            placeholder="Street name*"
            required
            inputClassName="text-sm py-2.5"
          />
          <Input
            id="placeOfResidence"
            name="placeOfResidence"
            label="Place of residence *"
            type="text"
            value={personal.placeOfResidence}
            onChange={(e) =>
              handlePersonalChange("placeOfResidence", e.target.value)
            }
            placeholder="Place of residence*"
            required
            inputClassName="text-sm py-2.5"
          />
          <Input
            id="phoneNumber"
            name="phoneNumber"
            label="Phone number *"
            type="tel"
            value={personal.phoneNumber}
            onChange={(e) =>
              handlePersonalChange("phoneNumber", e.target.value)
            }
            placeholder="Phone number*"
            required
            inputClassName="text-sm py-2.5"
          />
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={!allPersonalRequired}
          className="mt-2 w-fit"
        >
          Continue
        </Button>
      </form>
    )
  );
}
