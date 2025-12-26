import { Formik } from "formik";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { Input } from "../inputs/input.component";

export const LoginTab = () => {
  return (
    <div className="flex flex-col gap-10 items-center max-w-[454px] w-full">
      <p className="text-base font-medium text-[#333333]">Login</p>
      <div className="flex flex-col gap-4 w-full items-center">
        <div className="flex items-center justify-center gap-5  border border-[#333333] rounded-[40px] py-4  w-full">
          <FaFacebook className="text-[#0C82EE]" size={28} />
          <p>Login with Facebook</p>
        </div>
        <div className="flex items-center justify-center gap-5  border border-[#333333] rounded-[40px] py-4  w-full">
          <FaGoogle className=" bg-from" size={24} />
          <p>Login with Google</p>
        </div>
      </div>
      <div className="flex items-center gap-6 w-full">
        <div className="h-0.5 w-full bg-[#66666640]" />
        <p className="text-[#666666]">OR</p>
        <div className="h-0.5 w-full bg-[#66666640]" />
      </div>

      <Formik
        onSubmit={(e) => {
          console.log(e);
        }}
        initialValues={{
          firstname: "",
          lastname: "",
          email: "",
        }}
      >
        {({ values, handleSubmit, errors, handleChange, handleBlur }) => {
          return (
            <form
              className="flex flex-col gap-4 w-full"
              onSubmit={handleSubmit}
            >
              <Input
                name="email"
                value={values.firstname}
                error={errors.firstname}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder=""
                label="Email"
              />

              <Input
                name="password"
                value={values.email}
                error={errors.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder=""
                label="Password"
              />
              <button
                className="bg-[#111111] disabled:bg-[#11111140] rounded-[40px] py-4 text-white font-medium text-xl"
                type="submit"
              >
                Login
              </button>
            </form>
          );
        }}
      </Formik>
    </div>
  );
};
