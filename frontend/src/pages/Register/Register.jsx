export default function Register() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-[#12121A] flex flex-col justify-center gap-8 items-center p-10 rounded-md shadow-[0_0_24px_#22D3EE]">
        <div className="text-[#A78BFA]">Ready to Level Up?</div>
        <div className="text-white font-extrabold text-5xl text-shadow-[0_0_24px_#22D3EE]">
          JOIN GEARVERSE
        </div>
        <div className="text-white">Create Your Account</div>
        <form className="flex flex-col gap-8 p-4">
          <div className="flex flex-row gap-2">
            <div className="flex flex-col">
              <label className="text-white" for="firstname">
                First name
              </label>
              {/* <img
                src="/frontend/public/icons/account-svgrepo-com.svg"
                alt="firstname icon"
              ></img> */}
              <input
                className="px-4 py-2 border-2 rounded-md border-[#22223A] bg-[#2A2A45] text-white"
                id="firstname"
                type="text"
              ></input>
            </div>
            <div className="flex flex-col">
              <label className="text-white" for="lastname">
                Last name
              </label>
              <input
                className="px-4 py-2 border-2 rounded-md border-[#22223A] bg-[#2A2A45] text-white"
                id="lastname"
                type="text"
              ></input>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-white" for="email">
              Email Address
            </label>
            <input
              className="px-4 py-2 border-2 rounded-md border-[#22223A] bg-[#2A2A45] text-white"
              id="email"
              type="email"
            ></input>
          </div>
          <div className="flex flex-col">
            <label className="text-white" for="password">
              Password
            </label>
            <input
              className="px-4 py-2 border-2 rounded-md border-[#22223A] bg-[#2A2A45] text-white"
              id="password"
              type="password"
            ></input>
          </div>
          <div className="flex flex-col">
            <label className="text-white" for="confirm-password">
              Confirm Password
            </label>
            <input
              className="px-4 py-2 border-2 rounded-md border-[#22223A] bg-[#2A2A45] text-white"
              id="confirm-password"
              type="password"
            ></input>
          </div>
          <label className="flex items-center gap-2 text-white">
            <input type="checkbox" className="mr-2" />
            <span>
              I agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>.
            </span>
          </label>
          <button
            className="px-4 py-2 text-white bg-[#8B5CF6] rounded-md"
            type="button"
          >
            INITIALIZE ACCOUNT
          </button>
        </form>
      </div>
    </div>
  );
}
