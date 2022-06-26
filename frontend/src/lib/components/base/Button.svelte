<script type="ts">
  import ButtonType from "./ButtonType";
  let type: ButtonType;
  let disabled = false;

  function colors() {
    switch (type) {
      case ButtonType.Primary:
        return "bg-sky-700 text-sky-50";
      case ButtonType.Secondary:
        return "bg-stone-800 text-stone-50";
      case ButtonType.Danger:
        return "bg-red-800 text-red-50";
      default:
        return "";
    }
  }

  export { type, disabled };
</script>

<button class={"ap-button " + colors()} {disabled}><slot /></button>
