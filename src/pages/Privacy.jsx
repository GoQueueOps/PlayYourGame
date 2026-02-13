function Privacy() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-4">

        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>

        <p>
          Play Your Game respects your privacy. This policy explains how we
          collect and use your data.
        </p>

        <p>
          We collect basic information such as your name, phone number, email,
          and location to provide nearby court discovery and booking services.
        </p>

        <p>
          Location data is used only to show courts near you. You can deny
          location access and search manually.
        </p>

        <p>
          We do not sell your personal data. Payment details are handled securely
          by third-party payment providers.
        </p>

        <p>
          You may request deletion of your data by contacting us at{" "}
          <span className="text-green-400">support@playyourgame.in</span>.
        </p>

        <p className="text-gray-400 text-sm mt-8">
          Last updated: 2026
        </p>

      </div>
    </div>
  );
}

export default Privacy;
