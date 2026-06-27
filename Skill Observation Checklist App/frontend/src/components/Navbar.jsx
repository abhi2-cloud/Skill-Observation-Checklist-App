function Navbar() {
  const userName =
    localStorage.getItem("user_name");

  return (
    <div
      className="
      bg-white
      shadow
      rounded-xl
      p-5
      flex
      justify-between
      items-center
      mb-6
      "
    >
      <div>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>
      </div>

      <div>
        👤 {userName}
      </div>
    </div>
  );
}

export default Navbar;