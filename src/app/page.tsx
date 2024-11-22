export default function Home() {
  return (
    <>
      <div className="grid w-full auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="mt-4 min-h-[100vh] w-full flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </>
  )
}
