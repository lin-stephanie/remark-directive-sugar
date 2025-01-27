The `:badge` directive allows you to add customizable markers to improve document visuals.

There are built-in badges that automatically apply predefined labels and colors based on the configuration:

- `badge-a`: :badge-a
- `badge-v`: :badge-v
- `badge-o`: :badge-o
- `badge-f`: :badge-f
- `badge-t`: :badge-t
- `badge-w`: :badge-w
- `badge-g`: :badge-g

Additionally, you can use `:badge[Text]{<color>}` for easy visual customization of badges. For example: `:badge[ISSUE]{style="--badge-color-light:#faf233; --badge-color-dark:#1af233"}` will display as :badge[ISSUE]{style="--badge-color-light:#faf233; --badge-color-dark:#1af233"}. If no color is specified, the default appearance will look like :badge[This]{style="--badge-color-light:#bebfc5; --badge-color-dark:#bebfc5"}.
