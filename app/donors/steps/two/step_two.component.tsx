"use client";

import { Radio } from "@/app/components/inputs/Radio";

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
        className="flex flex-col gap-6 mt-6 xl:mt-10"
      >
        <h2 className="text-lg font-semibold text-text-primary">
          Enter your personal details
        </h2>
        <p className="text-sm text-text-secondary -mt-2">
          Enter your personal details as stated on your passport, ID card or
          driver&apos;s license.
        </p>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text-primary">Gender</span>
          <div className="flex gap-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-text-primary mb-1.5"
            >
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              value={personal.fullName}
              onChange={(e) => handlePersonalChange("fullName", e.target.value)}
              placeholder="Full name"
              className="w-full text-sm border border-border rounded-lg px-3.5 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-medium text-text-primary mb-1.5"
            >
              Date of birth
            </label>
            <input
              id="dateOfBirth"
              type="text"
              value={personal.dateOfBirth}
              onChange={(e) =>
                handlePersonalChange("dateOfBirth", e.target.value)
              }
              placeholder="DD-MM-YYYY"
              className="w-full text-sm border border-border rounded-lg px-3.5 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <label
              htmlFor="correspondenceName"
              className="block text-sm font-medium text-text-primary mb-1.5"
            >
              Correspondence name
            </label>
            <input
              id="correspondenceName"
              type="text"
              value={personal.correspondenceName}
              onChange={(e) =>
                handlePersonalChange("correspondenceName", e.target.value)
              }
              placeholder="Correspondence name"
              className="w-full text-sm border border-border rounded-lg px-3.5 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>

        <div className="bg-[#FDF2F4] rounded-lg p-4 sm:p-5 w-full">
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            Email address
          </h3>
          <p className="text-xs text-text-secondary mb-3">
            A valid email address is required to arrange your donation
            arrangements. Please ensure you enter it correctly.
          </p>
          <input
            id="email"
            type="email"
            value={personal.email}
            onChange={(e) => handlePersonalChange("email", e.target.value)}
            placeholder="Email address *"
            required
            className="w-full text-sm border border-border rounded-lg px-3.5 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-white"
          />
        </div>

        <h2 className="text-lg font-semibold text-text-primary mt-2">
          Enter your personal details
        </h2>
        <div className="flex flex-col gap-2 -mt-2">
          <span className="text-sm font-medium text-text-primary">
            Country of residence
          </span>
          <div className="flex flex-wrap gap-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="postalCode"
              className="block text-sm font-medium text-text-primary mb-1.5"
            >
              Postal code
            </label>
            <input
              id="postalCode"
              type="text"
              value={personal.postalCode}
              onChange={(e) =>
                handlePersonalChange("postalCode", e.target.value)
              }
              placeholder="Postal code"
              className="w-full text-sm border border-border rounded-lg px-3.5 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <label
              htmlFor="houseNumber"
              className="block text-sm font-medium text-text-primary mb-1.5"
            >
              House number *
            </label>
            <input
              id="houseNumber"
              type="text"
              value={personal.houseNumber}
              onChange={(e) =>
                handlePersonalChange("houseNumber", e.target.value)
              }
              placeholder="House number*"
              required
              className="w-full text-sm border border-border rounded-lg px-3.5 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            Address
          </label>
          <input
            id="address"
            type="text"
            value={personal.address}
            onChange={(e) => handlePersonalChange("address", e.target.value)}
            placeholder="Address"
            className="w-full text-sm border border-border rounded-lg px-3.5 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="streetName"
              className="block text-sm font-medium text-text-primary mb-1.5"
            >
              Street name *
            </label>
            <input
              id="streetName"
              type="text"
              value={personal.streetName}
              onChange={(e) =>
                handlePersonalChange("streetName", e.target.value)
              }
              placeholder="Street name*"
              required
              className="w-full text-sm border border-border rounded-lg px-3.5 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <label
              htmlFor="placeOfResidence"
              className="block text-sm font-medium text-text-primary mb-1.5"
            >
              Place of residence *
            </label>
            <input
              id="placeOfResidence"
              type="text"
              value={personal.placeOfResidence}
              onChange={(e) =>
                handlePersonalChange("placeOfResidence", e.target.value)
              }
              placeholder="Place of residence*"
              required
              className="w-full text-sm border border-border rounded-lg px-3.5 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            Phone number *
          </label>
          <input
            id="phoneNumber"
            type="tel"
            value={personal.phoneNumber}
            onChange={(e) =>
              handlePersonalChange("phoneNumber", e.target.value)
            }
            placeholder="Phone number*"
            required
            className="w-full text-sm border border-border rounded-lg px-3.5 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <button
          type="submit"
          disabled={!allPersonalRequired}
          className="mt-2 text-sm font-medium py-2.5 px-5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors w-fit"
        >
          Continue
        </button>
      </form>
    )
  );
}
